export function downloadCsv(filename: string, rows: any[], headers?: string[]) {
  const cols = headers ?? Object.keys(rows[0] || {});
  const escape = (v: any) => {
    const s = String(v ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    cols.join(','),
    ...rows.map(r => cols.map(c => escape(r[c])).join(','))
  ].join('\n');

  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
