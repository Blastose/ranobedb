import { PUBLIC_IMAGE_URL } from '$env/static/public';
import type { Nullish } from '$lib/server/zod/schema';

export function formatDate(date: number) {
	if (date === 0) return 'Unknown';
	if (date === 9999) return 'TBA';

	const strDate = String(date);

	const NUM_CHARS_IN_DATE_STRING = 8; // e.g. 20220101 has 8 chars

	if (strDate.length !== NUM_CHARS_IN_DATE_STRING) {
		return null;
	}

	const day = strDate.slice(-2);
	const month = strDate.slice(-4, -2);
	const year = strDate.slice(0, -4);

	let dateBuild = year;
	if (month !== '00') {
		dateBuild = dateBuild + '-' + month;
	}
	if (day !== '00') {
		dateBuild = dateBuild + '-' + day;
	}

	return dateBuild;
}

export function buildImageUrl(filename: Nullish<string>) {
	if (!filename) {
		return null;
	}

	return `${PUBLIC_IMAGE_URL}${filename}`;
}
