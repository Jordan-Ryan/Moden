export function formatMinutes(totalMinutes: number): string {
	if (!isFinite(totalMinutes) || totalMinutes < 0) return '0m';
	const h = Math.floor(totalMinutes / 60);
	const m = Math.round(totalMinutes % 60);
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatPercent(value: number, decimals: number = 0): string {
	if (!isFinite(value)) return '0%';
	return `${(value * 100).toFixed(decimals)}%`;
}
