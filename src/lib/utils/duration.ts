export function formatDuration(minutes: number | null | undefined): string | null {
	if (!minutes) {
		return null;
	}
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	const hrs = h === 1 ? 'hr' : 'hrs';
	const mins = m === 1 ? 'min' : 'mins';
	return `${h} ${hrs} ${m} ${mins}`;
}
