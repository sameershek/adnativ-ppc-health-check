import React from 'react';

export function Tabs({
  tabs, active, onChange
}: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div role="tablist" aria-label="Data tabs" className="flex gap-2">
      {tabs.map(t => (
        <button
          key={t}
          role="tab"
          aria-selected={active === t}
          className={`px-3 py-1.5 rounded-xl text-sm border ${active===t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}
          onClick={() => onChange(t)}
        >{t}</button>
      ))}
    </div>
  );
}
