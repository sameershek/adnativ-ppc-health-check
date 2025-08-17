import React, { useState } from 'react';

export function EmailCapture({
  enabled, setEnabled, defaultEndpoint, buildPayload
}: {
  enabled: boolean;
  setEnabled: (b: boolean) => void;
  defaultEndpoint?: string;
  buildPayload: () => any;
}) {
  const [email, setEmail] = useState('');
  const [endpoint, setEndpoint] = useState(defaultEndpoint ?? '');

  async function submit() {
    if (!endpoint) { alert('Please set a Formspree or Netlify Forms endpoint.'); return; }
    if (!email) { alert('Please enter your email.'); return; }
    try {
      const payload = { email, ...buildPayload() };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert('Sent! Check your inbox.');
    } catch (e:any) {
      alert(`Failed to send: ${e.message}`);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Email me the report (optional)</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} aria-label="Enable email capture"/>
          Enable
        </label>
      </div>
      <p className="text-sm opacity-80">When enabled, we’ll POST your email and summary JSON to your Formspree/Netlify endpoint. Nothing is sent if disabled.</p>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
        <input className="input" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="input md:col-span-2" placeholder="https://formspree.io/f/xxxxxx (or Netlify endpoint)"
               value={endpoint} onChange={e=>setEndpoint(e.target.value)}/>
      </div>
      <div>
        <button className="btn" disabled={!enabled} onClick={submit}>Email me the report</button>
      </div>
    </div>
  );
}
