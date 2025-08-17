import React, { useMemo, useRef, useState } from 'react';
import { UploadDropzone } from './ui/UploadDropzone';
import { SlidersPanel } from './ui/SlidersPanel';
import { DataTable } from './ui/DataTable';
import { Tabs } from './ui/Tabs';
import { ScoreCard } from './ui/ScoreCard';
import { EmailCapture } from './ui/EmailCapture';
import { FooterCTA } from './ui/FooterCTA';
import { ThemeToggle } from './ui/ThemeToggle';
import { parseCsvFile } from './parser';
import { aggregateCampaigns, computeOverallScore, defaultThresholds, defaultWeights } from './scoring';
import { Row, Thresholds } from './types';
import { downloadCsv } from './utils/csv';
import { ToastMsg, Toasts } from './ui/Toast';
import { formatCurrency } from './utils/format';
import { generatePdfReport, topFixes } from './report';

export default function App() {
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<'Campaigns'|'Good'|'Bad'|'All Rows'>('Campaigns');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);

  function pushToast(text: string, kind: ToastMsg['kind']='info') {
    const t: ToastMsg = { id: Math.random().toString(36).slice(2), text, kind };
    setToasts(s => [...s, t]);
    setTimeout(()=>setToasts(s=>s.filter(x=>x.id!==t.id)), 4500);
  }

  async function onFile(f: File) {
    try {
      const r = await parseCsvFile(f, thresholds);
      setRows(r);
      pushToast(`Loaded ${r.length} rows`, 'success');
    } catch (e:any) {
      pushToast(e.message || 'Failed to parse CSV', 'error');
    }
  }

  // Derived slices
  const goodRows = useMemo(()=> rows.filter(r=>r.isGood), [rows]);
  const badRows = useMemo(()=> rows.filter(r=>r.isBad), [rows]);
  const campaigns = useMemo(()=> aggregateCampaigns(rows), [rows]);
  const score = useMemo(()=> computeOverallScore(rows, thresholds, defaultWeights), [rows, thresholds]);

  function exportFlagged(kind: 'Good' | 'Bad') {
    const src = kind === 'Good' ? goodRows : badRows;
    const data = src.map(r => ({
      Campaign: r.campaign, Term: r.term, Cost: r.cost, Sales: r.sales, Orders: r.orders,
      CTR: r.ctr, CVR: r.cvr, ACOS: r.acos
    }));
    downloadCsv(`${kind.toLowerCase()}_rows.csv`, data);
  }

  function loadSample() {
    fetch('./sample/sample.csv').then(r=>r.blob()).then(b=>{
      onFile(new File([b], 'sample.csv', { type: 'text/csv' }));
    });
  }

  function downloadPDF() {
    if (!rows.length) { pushToast('Upload a CSV first', 'error'); return; }
    generatePdfReport({ rows, campaigns, thresholds, score });
  }

  const summaryPayload = () => ({
    score: score.score,
    label: score.label,
    thresholds,
    totals: score.overall.totals,
    fixes: topFixes(rows, campaigns, thresholds)
  });

  const rightPane = (
    <div className="space-y-4">
      {rows.length ? <ScoreCard score={score} /> : null}

      {rows.length ? (
        <div className="card flex flex-wrap gap-2 items-center justify-between">
          <Tabs tabs={['Campaigns', 'Good', 'Bad', 'All Rows']} active={tab} onChange={t=>setTab(t as any)} />
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={()=>exportFlagged('Bad')}>Export Bad CSV</button>
            <button className="btn-secondary" onClick={()=>exportFlagged('Good')}>Export Good CSV</button>
            <button className="btn" onClick={downloadPDF}>Download PDF Report</button>
          </div>
        </div>
      ) : null}

      {tab === 'Campaigns' && rows.length ? (
        <div className="card">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 text-sm font-semibold border-b border-slate-200 dark:border-slate-800">
            <div className="col-span-2">Campaign</div>
            <div>ACOS</div><div>CTR</div><div>CVR</div><div>Wasted</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {campaigns.map(c => (
              <div key={c.campaign} className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 items-center">
                <div className="col-span-2 font-medium truncate" title={c.campaign}>{c.campaign}</div>
                <div className="text-sm">{!isFinite(c.acos) ? '∞' : (c.acos*100).toFixed(2) + '%'}</div>
                <div className="text-sm">{(c.ctr*100).toFixed(2)}%</div>
                <div className="text-sm">{(c.cvr*100).toFixed(2)}%</div>
                <div className="text-sm">{formatCurrency(c.wastedSpend)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'Good' && <DataTable rows={goodRows} />}
      {tab === 'Bad' && <DataTable rows={badRows} />}
      {tab === 'All Rows' && <DataTable rows={rows} />}

      <EmailCapture enabled={emailEnabled} setEnabled={setEmailEnabled} buildPayload={summaryPayload} />
      <FooterCTA />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <header className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="AdNativ" className="h-8 w-8 rounded-md"/>
          <div>
            <h1 className="text-xl font-bold">AdNativ PPC Health Check</h1>
            <p className="text-sm opacity-80">Spot wasted ad spend and get a PPC health score in 60 seconds.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={loadSample}>Load sample CSV</button>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <UploadDropzone onFile={onFile} />
          <SlidersPanel thresholds={thresholds} setThresholds={(t)=>{
            setThresholds(t);
            if (rows.length) {
              // Re-evaluate classifications on threshold changes
              // Re-run parse is heavy; re-derive in-place:
              setRows(prev => prev.map(r => {
                const cvr = r.clicks > 0 ? r.orders / r.clicks : 0;
                const acos = r.sales > 0 ? r.cost / r.sales : (r.cost > 0 ? Number.POSITIVE_INFINITY : 0);
                const isBad = (acos > t.targetACOS && cvr < t.minCVR) || (r.orders === 0 && r.cost >= t.zeroOrderWaste);
                const isGood = (acos <= t.targetACOS && cvr >= t.minCVR);
                return { ...r, cvr, acos, isBad, isGood };
              }));
            }
          }} />
        </div>
        <div className="lg:col-span-2">
          {rightPane}
        </div>
      </div>

      <Toasts items={toasts} onDismiss={(id)=>setToasts(s=>s.filter(t=>t.id!==id))}/>
    </div>
  );
}
