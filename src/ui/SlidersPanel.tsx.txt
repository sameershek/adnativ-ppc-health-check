import React from 'react';
import { Thresholds } from '../types';

export function SlidersPanel({
  thresholds, setThresholds
}: { thresholds: Thresholds; setThresholds: (t: Thresholds) => void }) {
  function upd<K extends keyof Thresholds>(k: K, v: number) {
    setThresholds({ ...thresholds, [k]: v });
  }
  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">Controls</h3>

      <Slider label={`Target ACOS (${(thresholds.targetACOS*100).toFixed(0)}%)`}
        min={0} max={1} step={0.01}
        value={thresholds.targetACOS}
        onChange={v => upd('targetACOS', v)} />

      <Slider label={`Min CTR (${(thresholds.minCTR*100).toFixed(2)}%)`}
        min={0} max={0.1} step={0.001}
        value={thresholds.minCTR}
        onChange={v => upd('minCTR', v)} />

      <Slider label={`Min CVR (${(thresholds.minCVR*100).toFixed(1)}%)`}
        min={0} max={0.5} step={0.005}
        value={thresholds.minCVR}
        onChange={v => upd('minCVR', v)} />

      <Slider label={`Zero-order spend threshold ($${thresholds.zeroOrderWaste.toFixed(0)})`}
        min={0} max={200} step={1}
        value={thresholds.zeroOrderWaste}
        onChange={v => upd('zeroOrderWaste', v)} />
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }:{
  label: string; min: number; max: number; step: number; value: number; onChange:(v:number)=>void
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
        <span className="text-xs opacity-70">{value}</span>
      </div>
      <input className="slider" type="range" min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(Number(e.target.value))} aria-label={label}/>
    </div>
  );
}
