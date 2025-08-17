import React from 'react';

export type ToastMsg = { id: string; text: string; role?: 'status' | 'alert'; kind?: 'info'|'error'|'success' };
export function Toasts({ items, onDismiss }: { items: ToastMsg[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {items.map(t => (
        <div key={t.id} role={t.role ?? 'status'}
             className={`rounded-xl px-3 py-2 text-sm shadow-lg border ${
               t.kind==='error' ? 'bg-red-600 text-white border-red-500' :
               t.kind==='success' ? 'bg-emerald-600 text-white border-emerald-500' :
               'bg-slate-900 text-white border-slate-700'
             }`}>
          <div className="flex items-center gap-3">
            <span>{t.text}</span>
            <button aria-label="Dismiss" className="opacity-70 hover:opacity-100" onClick={()=>onDismiss(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
