import type { Language } from '$lib/server/db/dbTypes';
import { languageNames, languageSortPrio } from './dbConsts';

export function arrayDiff<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => !b.some((item2) => item2.id === item1.id));
}

export function arrayIntersection<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => b.some((item2) => item2.id === item1.id));
}

// From https://github.com/jimmywarting/groupby-polyfill/blob/main/lib/polyfill.js
export function groupBy<T, K extends string | number | symbol>(
	iterable: Iterable<T>,
	callbackfn: (arg0: T, arg1: number) => K,
): { [s: string]: T[] } {
	const obj = Object.assign({});
	let i = 0;
	for (const value of iterable) {
		const key = callbackfn(value, i++);
		key in obj ? obj[key].push(value) : (obj[key] = [value]);
	}
	return obj;
}

// For TS, since Svelte 4 cannot have TS in markup
export function getLanguageFromString(langCode: string) {
	return languageNames[langCode as Language];
}

export function sortByLang<T extends { lang: Language | null }>(objs: T[], olang?: Language) {
	objs.sort((a, b) => {
		if (a.lang === null) {
			return -1;
		}
		if (b.lang === null) {
			return 1;
		}
		if (a.lang === olang) {
			return -1;
		}
		return languageSortPrio[a.lang] - languageSortPrio[b.lang];
	});
	return objs;
}

export function sortByLangObjEntries<T extends object>(entries: [string, T[]][], olang?: Language) {
	entries.sort((a, b) => {
		const langA = a[0] as Language;
		const langB = b[0] as Language;
		if (langA === olang) {
			return -1;
		}
		if (langB === olang) {
			return 1;
		}
		return languageSortPrio[langA] - languageSortPrio[langB];
	});
	return entries;
}
