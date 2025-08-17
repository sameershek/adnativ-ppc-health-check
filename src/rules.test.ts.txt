import { isBadRow, isGoodRow, defaultThresholds } from './scoring';
import { Row } from './types';

const t = defaultThresholds;
const base: Row = {
  campaign: 'C', adGroup: 'G', matchType: 'phrase', term: 'x',
  impressions: 1000, clicks: 100, cost: 30, sales: 200, orders: 8,
  ctr: 0.1, cvr: 0.08, acos: 0.15, isGood: false, isBad: false
};

describe('row rules', () => {
  it('bad when ACOS > target and CVR < min', () => {
    const r = { ...base, acos: t.targetACOS + 0.1, cvr: t.minCVR - 0.01 };
    expect(isBadRow(r, t)).toBe(true);
  });

  it('bad when zero orders and spend >= threshold', () => {
    const r = { ...base, orders: 0, cost: t.zeroOrderWaste + 1, sales: 0, cvr: 0, acos: Infinity };
    expect(isBadRow(r, t)).toBe(true);
  });

  it('good when ACOS <= target and CVR >= min', () => {
    const r = { ...base, acos: t.targetACOS - 0.05, cvr: t.minCVR + 0.02 };
    expect(isGoodRow(r, t)).toBe(true);
  });
});
