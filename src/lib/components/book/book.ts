import { PUBLIC_IMAGE_URL } from '$env/static/public';
import { avatarUrlPrefix } from '$lib/db/dbConsts';
import type { Nullish } from '$lib/server/zod/schema';

export function buildImageUrl(filename: Nullish<string>, prefix?: string) {
	if (!filename) {
		return null;
	}

	return `${PUBLIC_IMAGE_URL}${prefix ? `${prefix}/` : ''}${filename}`;
}

export function buildAvatarImageUrl(filename: Nullish<string>) {
	return buildImageUrl(filename, avatarUrlPrefix);
}
