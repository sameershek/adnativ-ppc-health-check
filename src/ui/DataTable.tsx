import React, { useMemo, useState } from 'react';
import { Row } from '../types';
import { formatCurrency, formatNumber, formatPct } from '../utils/format';
import { downloadCsv } from '../utils/csv';

type Column = {
  key: keyof Row | 'isGood' | 'isBad';
  label: string;
  render?: (r: Row) => React.ReactNode;
};

const COLUMNS: Column[] = [
  { key: 'campaign', label: 'Campaign' },
  { key: 'adGroup', label: 'Ad Group' },
  { key: 'matchType', label: 'Match' },
  { key: 'term', label: 'Search Term' },
  { key: 'impressions', label: 'Impr.' , render: r => formatNumber(r.impressions) },
  { key: 'clicks', label: 'Clicks', render: r => formatNumber(r.clicks) },
  { key: 'cost', label: 'Cost', render: r => formatCurrency(r.cost) },
  { key: 'sales', label: '7d Sales', render: r => formatCurrency(r.sales) },
  { key: 'orders', label: '7d Orders' },
  { key: 'ctr', label: 'CTR', render: r => formatPct(r.ctr) },
  { key: 'cvr', label: 'CVR', render: r => formatPct(r.cvr) },
  { key: 'acos', label: 'ACOS', render: r => formatPct(r.acos) },
  { key: 'isGood', label: 'Good' },
  { key: 'isBad', label: 'Bad' }
];

export function DataTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<keyof Row | 'isGood' | 'isBad'>('cost');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    let out = rows;
    if (k) {
      out = rows.filter(r =>
        r.campaign.toLowerCase().includes(k) ||
        r.term.toLowerCase().includes(k) ||
        r.adGroup.toLowerCase().includes(k) ||
        r.matchType.toLowerCase().includes(k)
      );
    }
    out = [...out].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      const cmp = (av ?? 0) > (bv ?? 0) ? 1 : (av ?? 0) < (bv ?? 0) ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [rows, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  function exportCurrent() {
    const data = filtered.map(r => ({
      Campaign: r.campaign,
      'Ad Group': r.adGroup,
      Match: r.matchType,
      Term: r.term,
      Impressions: r.impressions,
      Clicks: r.clicks,
      Cost: r.cost,
      Sales7d: r.sales,
      Orders7d: r.orders,
      CTR: r.ctr,
      CVR: r.cvr,
      ACOS: r.acos,
      Good: r.isGood,
      Bad: r.isBad
    }));
    downloadCsv('ppc_rows.csv', data);
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-3">
        <input className="input" placeholder="Filter by campaign, term, ad group, match…" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }}/>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Sort:</label>
          <select className="input" value={String(sortKey)} onChange={e=>setSortKey(e.target.value as any)}>
            {COLUMNS.map(c => <option key={String(c.key)} value={String(c.key)}>{c.label}</option>)}
          </select>
          <button className="btn-secondary" onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
          <button className="btn" onClick={exportCurrent}>Export CSV (current)</button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-900">
            <tr>
              {COLUMNS.map(c => (
                <th key={String(c.key)} className="text-left p-2 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                {COLUMNS.map(c => (
                  <td key={String(c.key)} className="p-2 whitespace-nowrap">
                    {c.render ? c.render(r) : String((r as any)[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs opacity-70">Rows: {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1} aria-label="Prev page">Prev</button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button className="btn-secondary" onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page===totalPages} aria-label="Next page">Next</button>
        </div>
      </div>
    </div>
  );
}
