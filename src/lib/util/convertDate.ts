export function convertDate(date: Date | null | undefined, returnNull?: boolean) {
	if (!date) {
		if (returnNull) {
			return null;
		}
		return 'N/A';
	}
	return date.toISOString().substring(0, 10);
}
