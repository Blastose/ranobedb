import type { Nullish } from '$lib/server/zod/schema';

function escapeLike(str: string) {
	return str.replace(/[_%\\]/g, '\\$&');
}

export function addCharacterBetweenString(str: Nullish<string>, char: string) {
	if (!str) {
		return '';
	}
	str = escapeLike(str);

	const newStrArr = [];
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '\\') {
			if (i + 1 === str.length) {
				newStrArr.push(str[i]);
			} else {
				newStrArr.push(str[i] + str[i + 1]);
				i += 1;
			}
		} else {
			newStrArr.push(str[i]);
		}
	}

	return `${char}${newStrArr.join(char)}${char}`;
}
