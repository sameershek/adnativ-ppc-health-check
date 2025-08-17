import { computeOverallScore, defaultThresholds, defaultWeights } from './scoring';
import { Row } from './types';

function mkRow(partial: Partial<Row>): Row {
  return {
    campaign: 'C', adGroup: 'G', matchType: 'exact', term: 't',
    impressions: 1000, clicks: 100, cost: 50, sales: 200, orders: 10,
    ctr: 0.1, cvr: 0.1, acos: 0.25, isGood: false, isBad: false,
    ...partial
  };
}

describe('computeOverallScore', () => {
  it('scores high when ACOS below target and good CVR/CTR with low waste', () => {
    const rows: Row[] = [
      mkRow({ cost: 50, sales: 400, clicks: 100, orders: 12, impressions: 5000 }), // ACOS 0.125
      mkRow({ cost: 30, sales: 200, clicks: 60, orders: 8, impressions: 4000 })
    ];
    const res = computeOverallScore(rows, defaultThresholds, defaultWeights);
    expect(res.score).toBeGreaterThan(7.0);
    expect(res.label === 'Good' || res.label === 'Excellent').toBe(true);
  });

  it('scores low when waste share is high and ACOS poor', () => {
    const rows: Row[] = [
      mkRow({ cost: 100, sales: 50, clicks: 100, orders: 2, impressions: 6000 }), // ACOS 2.0
      mkRow({ cost: 80, sales: 0, clicks: 50, orders: 0, impressions: 5000 })     // waste
    ];
    const res = computeOverallScore(rows, defaultThresholds, defaultWeights);
    expect(res.score).toBeLessThan(5.5);
    expect(res.label).toBe('Poor');
  });
});
