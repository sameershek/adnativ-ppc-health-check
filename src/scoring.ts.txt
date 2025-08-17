import { Row, Thresholds, Weights, ScoreResult } from './types';

// ======= Single place to tweak thresholds & weights =======
export const defaultThresholds: Thresholds = {
  targetACOS: 0.35,
  minCTR: 0.003,
  minCVR: 0.08,
  zeroOrderWaste: 25
};

export const defaultWeights: Weights = {
  efficiency: 0.35,
  conversion: 0.25,
  relevance: 0.15,
  waste: 0.25
};

// Normalization knobs (tweak freely)
export const normalization = {
  // Efficiency: 10 at or below target; 0 at >= 2x target
  efficiencyZeroAtMultiplier: 2.0,
  // CTR: 10 at minCTR*ctrGoodMultiplier
  ctrGoodMultiplier: 1.5,
  // CVR: 10 at minCVR*cvrGoodMultiplier
  cvrGoodMultiplier: 1.5,
  // Waste share (zero-order cost / total cost)
  wasteGoodShare: 0.10,
  wasteBadShare: 0.50
};

// ======= Row classification rules =======
export function isBadRow(r: Row, t: Thresholds): boolean {
  const cond1 = r.acos > t.targetACOS && r.cvr < t.minCVR;
  const cond2 = r.orders === 0 && r.cost >= t.zeroOrderWaste;
  return cond1 || cond2;
}

export function isGoodRow(r: Row, t: Thresholds): boolean {
  return r.acos <= t.targetACOS && r.cvr >= t.minCVR;
}

// ======= Campaign aggregation =======
export function aggregateCampaigns(rows: Row[]) {
  const map = new Map<string, {
    impressions: number; clicks: number; cost: number; sales: number; orders: number;
    wastedSpend: number; goodCount: number; badCount: number; totalRows: number;
  }>();
  for (const r of rows) {
    const key = r.campaign;
    const m = map.get(key) ?? {
      impressions: 0, clicks: 0, cost: 0, sales: 0, orders: 0,
      wastedSpend: 0, goodCount: 0, badCount: 0, totalRows: 0
    };
    m.impressions += r.impressions;
    m.clicks += r.clicks;
    m.cost += r.cost;
    m.sales += r.sales;
    m.orders += r.orders;
    if (r.orders === 0) m.wastedSpend += r.cost;
    if (r.isGood) m.goodCount++;
    if (r.isBad) m.badCount++;
    m.totalRows++;
    map.set(key, m);
  }
  return Array.from(map.entries()).map(([campaign, m]) => {
    const ctr = m.impressions > 0 ? m.clicks / m.impressions : 0;
    const cvr = m.clicks > 0 ? m.orders / m.clicks : 0;
    const acos = m.sales > 0 ? m.cost / m.sales : (m.cost > 0 ? Number.POSITIVE_INFINITY : 0);
    return { campaign, ...m, ctr, cvr, acos };
  });
}

// ======= Overall score =======
const clamp = (v: number, a = 0, b = 10) => Math.max(a, Math.min(b, v));

export function computeOverallScore(rows: Row[], t: Thresholds, w: Weights): ScoreResult {
  const totals = rows.reduce((acc, r) => {
    acc.impressions += r.impressions;
    acc.clicks += r.clicks;
    acc.cost += r.cost;
    acc.sales += r.sales;
    acc.orders += r.orders;
    if (r.orders === 0) acc.zeroOrderCost += r.cost;
    return acc;
  }, { impressions: 0, clicks: 0, cost: 0, sales: 0, orders: 0, zeroOrderCost: 0 });

  const overallCTR = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const overallCVR = totals.clicks > 0 ? totals.orders / totals.clicks : 0;
  const overallACOS = totals.sales > 0 ? totals.cost / totals.sales : (totals.cost > 0 ? Number.POSITIVE_INFINITY : 0);
  const wasteShare = totals.cost > 0 ? totals.zeroOrderCost / totals.cost : 0;

  // Efficiency
  const effZeroAt = t.targetACOS * normalization.efficiencyZeroAtMultiplier;
  const effScore = Number.isFinite(overallACOS)
    ? clamp(10 * (1 - (overallACOS - t.targetACOS) / (effZeroAt - t.targetACOS)))
    : 0;

  // Conversion (CVR)
  const cvrTarget = t.minCVR * normalization.cvrGoodMultiplier;
  const cvrScore = clamp(10 * (overallCVR / cvrTarget));

  // Relevance (CTR)
  const ctrTarget = t.minCTR * normalization.ctrGoodMultiplier;
  const ctrScore = clamp(10 * (overallCTR / ctrTarget));

  // Waste control
  const { wasteGoodShare, wasteBadShare } = normalization;
  let wasteScore: number;
  if (wasteShare <= wasteGoodShare) wasteScore = 10;
  else if (wasteShare >= wasteBadShare) wasteScore = 0;
  else {
    const span = wasteBadShare - wasteGoodShare;
    wasteScore = clamp(10 * (1 - (wasteShare - wasteGoodShare) / span));
  }

  const final = Number(((effScore * w.efficiency) +
                        (cvrScore * w.conversion) +
                        (ctrScore * w.relevance) +
                        (wasteScore * w.waste)).toFixed(1));

  const label = final >= 8.5 ? 'Excellent' : final >= 7 ? 'Good' : final >= 5.5 ? 'Fair' : 'Poor';

  return {
    score: final,
    label,
    breakdown: {
      efficiency: Number(effScore.toFixed(1)),
      conversion: Number(cvrScore.toFixed(1)),
      relevance: Number(ctrScore.toFixed(1)),
      waste: Number(wasteScore.toFixed(1))
    },
    overall: {
      acos: overallACOS,
      ctr: overallCTR,
      cvr: overallCVR,
      wastedSpendShare: wasteShare,
      totals: { cost: totals.cost, sales: totals.sales, clicks: totals.clicks, impressions: totals.impressions, orders: totals.orders }
    }
  };
}
