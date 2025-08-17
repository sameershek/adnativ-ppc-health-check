import React from 'react';
import { CampaignSummary } from '../types';
import { formatCurrency, formatPct } from '../utils/format';

export function CampaignSummaryRow({ c }: { c: CampaignSummary }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 items-center border-b border-slate-200 dark:border-slate-800">
      <div className="col-span-2 font-medium truncate" title={c.campaign}>{c.campaign}</div>
      <div className="text-sm">{formatPct(c.acos)}</div>
      <div className="text-sm">{formatPct(c.ctr)}</div>
      <div className="text-sm">{formatPct(c.cvr)}</div>
      <div className="text-sm">{formatCurrency(c.wastedSpend)}</div>
    </div>
  );
}
