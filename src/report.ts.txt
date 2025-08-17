import jsPDF from 'jspdf';
import { Row, Thresholds, ScoreResult, CampaignSummary } from './types';
import { formatCurrency, formatPct, formatRatio } from './utils/format';

export function topFixes(rows: Row[], campaigns: CampaignSummary[], t: Thresholds): string[] {
  const zeroWaste = rows.filter(r => r.orders === 0).sort((a, b) => b.cost - a.cost).slice(0, 3);
  const highAcosLowCvr = rows
    .filter(r => isFinite(r.acos) && r.acos > t.targetACOS && r.cvr < t.minCVR)
    .sort((a, b) => (b.acos - a.acos))
    .slice(0, 2);

  const fixes: string[] = [];
  for (const r of zeroWaste) {
    fixes.push(`Cut/Negate "${r.term}" (Campaign: ${r.campaign}) → ${formatCurrency(r.cost)} spent with 0 orders`);
  }
  for (const r of highAcosLowCvr) {
    fixes.push(`Bid down or move "${r.term}" → ACOS ${formatPct(r.acos)}, CVR ${formatPct(r.cvr)}`);
  }

  if (fixes.length === 0) fixes.push('Great job! No critical waste or high-ACOS low-CVR terms found.');
  return fixes.slice(0, 5);
}

export function generatePdfReport({
  rows,
  campaigns,
  thresholds,
  score
}: {
  rows: Row[];
  campaigns: CampaignSummary[];
  thresholds: Thresholds;
  score: ScoreResult;
}) {
  const doc = new jsPDF({ unit: 'pt' });
  const now = new Date();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AdNativ PPC Health Check', 40, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Date: ${now.toLocaleString()}`, 40, 70);
  doc.text(`Score: ${score.score}/10 (${score.label})`, 40, 88);
  doc.text(`Thresholds: Target ACOS ${formatPct(thresholds.targetACOS)} • Min CTR ${formatPct(thresholds.minCTR)} • Min CVR ${formatPct(thresholds.minCVR)} • Zero-order waste ${formatCurrency(thresholds.zeroOrderWaste)}`, 40, 106);

  const y1 = 130;
  doc.setFont('helvetica', 'bold');
  doc.text('Overall KPIs', 40, y1);
  doc.setFont('helvetica', 'normal');
  const kpiText = [
    `ACOS: ${formatPct(score.overall.acos)}`,
    `CTR: ${formatPct(score.overall.ctr)}`,
    `CVR: ${formatPct(score.overall.cvr)}`,
    `Wasted Spend Share: ${formatPct(score.overall.wastedSpendShare)}`,
    `Spend: ${formatCurrency(score.overall.totals.cost)} | Sales: ${formatCurrency(score.overall.totals.sales)} | Clicks: ${score.overall.totals.clicks} | Impr: ${score.overall.totals.impressions} | Orders: ${score.overall.totals.orders}`
  ].join('   •   ');
  doc.text(kpiText, 40, y1 + 20, { maxWidth: 520 });

  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Fixes', 40, y1 + 60);
  doc.setFont('helvetica', 'normal');
  const fixes = topFixes(rows, campaigns, thresholds);
  let y = y1 + 80;
  fixes.forEach((f, i) => {
    doc.text(`${i + 1}. ${f}`, 48, y, { maxWidth: 520 });
    y += 18;
  });

  // Small campaign table snippet (top 5 by wasted spend)
  const topWaste = [...campaigns].sort((a, b) => b.wastedSpend - a.wastedSpend).slice(0, 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Campaigns by Wasted Spend', 40, y + 20);
  doc.setFont('helvetica', 'normal');
  let ty = y + 40;
  topWaste.forEach(c => {
    doc.text(`• ${c.campaign} — Wasted ${formatCurrency(c.wastedSpend)} | ACOS ${formatPct(c.acos)} | CTR ${formatPct(c.ctr)} | CVR ${formatPct(c.cvr)} (${c.badCount} bad / ${c.totalRows} rows)`, 48, ty, { maxWidth: 520 });
    ty += 16;
  });

  doc.setFontSize(9);
  doc.text('© AdNativ — Privacy by default. Generated locally in your browser.', 40, 780);

  doc.save('AdNativ_PPC_Health_Check.pdf');
}

// small helper used only inside this file
function formatCurrency(n: number) { return `$${(n || 0).toFixed(2)}`; }
function formatPct(n: number) { return !isFinite(n) ? '∞' : `${(n * 100).toFixed(2)}%`; }
