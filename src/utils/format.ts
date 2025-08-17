export const formatCurrency = (n: number) => `$${(n || 0).toFixed(2)}`;
export const formatNumber = (n: number) => new Intl.NumberFormat().format(n || 0);
export const formatPct = (n: number) => (!isFinite(n) ? '∞' : `${(n * 100).toFixed(2)}%`);
export const formatRatio = (n: number) => (!isFinite(n) ? '∞' : n.toFixed(3));
