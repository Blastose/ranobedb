function padStartNumber(num: number) {
	return String(num).padStart(2, '0');
}

export function convertDate(date: Date | null | undefined, returnNull?: boolean) {
	if (!date) {
		if (returnNull) {
			return null;
		}
		return 'N/A';
	}
	return `${date.getUTCFullYear()}-${padStartNumber(date.getUTCMonth() + 1)}-${padStartNumber(
		date.getUTCDate()
	)}`;
}
