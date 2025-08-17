import React, { useRef, useState } from 'react';

export function UploadDropzone({
  onFile
}: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={`card flex flex-col items-center justify-center gap-3 py-8 ${drag ? 'ring-2 ring-indigo-500' : ''}`}
      aria-label="CSV upload dropzone"
    >
      <p className="text-center text-sm opacity-80">Drop your Amazon SP Search Term report CSV here</p>
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={() => ref.current?.click()}>Choose CSV</button>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">Expected columns: Campaign Name, Ad Group Name, Match Type, Customer Search Term, Impressions, Clicks, Cost, 7 Day Total Sales, 7 Day Total Orders (#)</p>
    </div>
  );
}
