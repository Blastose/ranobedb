export type LinkBeforeAfter = {
	before: string;
	after: string;
	name: string;
};

export type FullLink = LinkBeforeAfter & {
	value: string | number;
};

export const aniDbLink: LinkBeforeAfter = {
	before: 'https://anidb.net/anime/',
	after: '',
	name: 'AniDB',
};

export const bookwalkerSeriesLink: LinkBeforeAfter = {
	before: 'https://bookwalker.jp/series/',
	after: '/list/',
	name: 'Bookwalker',
};

export const bookwalkerAuthorLink: LinkBeforeAfter = {
	before: 'https://bookwalker.jp/author/',
	after: '',
	name: 'Bookwalker',
};

export const twitterLink: LinkBeforeAfter = {
	before: 'https://twitter.com/',
	after: '',
	name: 'Twitter',
};

export const pixivLink: LinkBeforeAfter = {
	before: 'https://www.pixiv.net/users/',
	after: '',
	name: 'Pixiv',
};

export const wikidataLink: LinkBeforeAfter = {
	before: 'https://www.wikidata.org/wiki/Q',
	after: '',
	name: 'Wikidata',
};

export function buildLink(fullLink: FullLink): string {
	const { before, after, value } = fullLink;
	return `${before}${value}${after}`;
}
