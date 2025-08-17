import React from 'react';
import { ScoreResult } from '../types';
import { formatPct } from '../utils/format';

export function ScoreCard({ score }: { score: ScoreResult }) {
  const color =
    score.label === 'Excellent' ? 'bg-emerald-600' :
    score.label === 'Good' ? 'bg-indigo-600' :
    score.label === 'Fair' ? 'bg-amber-600' : 'bg-rose-600';

  return (
    <div className="card flex flex-col gap-3" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="AdNativ logo" className="h-8 w-8 rounded-lg" />
          <div>
            <h2 className="font-semibold text-lg">AdNativ PPC Health Check</h2>
            <p className="text-sm opacity-80">Spot wasted ad spend and get a PPC health score in 60 seconds.</p>
          </div>
        </div>
        <div className={`${color} rounded-2xl px-4 py-2 text-white text-lg font-semibold`} aria-label="Overall score">
          {score.score}/10 <span className="text-sm opacity-90">({score.label})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
        <KPI label="ACOS" value={formatPct(score.overall.acos)} />
        <KPI label="CTR" value={formatPct(score.overall.ctr)} />
        <KPI label="CVR" value={formatPct(score.overall.cvr)} />
        <KPI label="% Spend w/ 0 Orders" value={formatPct(score.overall.wastedSpendShare)} />
        <KPI label="Breakdown" value={`Eff ${score.breakdown.efficiency} • Conv ${score.breakdown.conversion} • Rel ${score.breakdown.relevance} • Waste ${score.breakdown.waste}`} />
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
