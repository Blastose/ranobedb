export type LinkBeforeAfter = {
	before: string;
	after: string;
};

export type FullLink = LinkBeforeAfter & {
	value: string | number;
};

export const aniDbLink: LinkBeforeAfter = {
	before: 'https://anidb.net/anime/',
	after: '',
};

export const bookwalkerSeriesLink: LinkBeforeAfter = {
	before: 'https://bookwalker.jp/series/',
	after: '/list/',
};

export const wikidataLink: LinkBeforeAfter = {
	before: 'https://www.wikidata.org/wiki/Q',
	after: '',
};

export function buildLink(fullLink: FullLink): string {
	const { before, after, value } = fullLink;
	return `${before}${value}${after}`;
}
