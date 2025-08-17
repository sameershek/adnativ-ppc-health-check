import Papa from 'papaparse';
import { RawRow, Row, Thresholds } from './types';
import { isBadRow, isGoodRow } from './scoring';

export const REQUIRED_COLS = [
  'Campaign Name',
  'Ad Group Name',
  'Match Type',
  'Customer Search Term',
  'Impressions',
  'Clicks',
  'Cost',
  '7 Day Total Sales',
  '7 Day Total Orders (#)'
] as const;

export function validateHeaders(headers: string[]): string[] {
  const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
  return missing as string[];
}

export function toNumber(x: any): number {
  if (x === null || x === undefined || x === '') return 0;
  const n = typeof x === 'number' ? x : Number(String(x).replace(/[$,]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function deriveRow(raw: RawRow, t: Thresholds): Row {
  const impressions = toNumber(raw.Impressions);
  const clicks = toNumber(raw.Clicks);
  const cost = toNumber(raw.Cost);
  const sales = toNumber(raw['7 Day Total Sales']);
  const orders = toNumber(raw['7 Day Total Orders (#)']);

  const ctr = impressions > 0 ? clicks / impressions : 0;
  const cvr = clicks > 0 ? orders / clicks : 0;
  const acos = sales > 0 ? cost / sales : (cost > 0 ? Number.POSITIVE_INFINITY : 0);

  const base: Row = {
    campaign: raw['Campaign Name'],
    adGroup: raw['Ad Group Name'],
    matchType: raw['Match Type'],
    term: raw['Customer Search Term'],
    impressions, clicks, cost, sales, orders,
    ctr, cvr, acos,
    isGood: false,
    isBad: false
  };
  base.isBad = isBadRow(base, t);
  base.isGood = isGoodRow(base, t);
  return base;
}

export function parseCsvFile(file: File, t: Thresholds): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      worker: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const missing = validateHeaders(headers);
        if (missing.length) {
          reject(new Error(`Missing columns: ${missing.join(', ')}`));
          return;
        }
        try {
          const rows = (results.data || []).map(r => deriveRow(r, t));
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err)
    });
  });
}
