import { PUBLIC_IMAGE_URL } from '$env/static/public';
import type { Nullish } from '$lib/server/zod/schema';

export function buildImageUrl(filename: Nullish<string>) {
	if (!filename) {
		return null;
	}

	return `${PUBLIC_IMAGE_URL}${filename}`;
}
