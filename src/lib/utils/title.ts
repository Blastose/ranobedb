export function normalizeTitle(title: string | undefined | null) {
	if (!title) {
		return title;
	}

	const volumeNumberLeadingZeroes = /(vol\.?|volume) ?0+(\d+)/gi;
	title = title.replace(volumeNumberLeadingZeroes, '$1 $2');

	return title;
}
