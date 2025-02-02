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

export const malLink: LinkBeforeAfter = {
	before: 'https://myanimelist.net/manga/',
	after: '',
	name: 'MyAnimeList',
};

export const anilistLink: LinkBeforeAfter = {
	before: 'https://anilist.co/manga/',
	after: '',
	name: 'Anilist',
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

export const syosetuLink: LinkBeforeAfter = {
	before: 'https://mypage.syosetu.com/',
	after: '/',
	name: 'Syosetu',
};

export const kakuyomuLink: LinkBeforeAfter = {
	before: 'https://kakuyomu.jp/users/',
	after: '',
	name: 'Kakuyomu',
};

export const bskyLink: LinkBeforeAfter = {
	before: 'https://bsky.app/profile/',
	after: '',
	name: 'Bluesky',
};

export function buildLink(fullLink: FullLink): string {
	const { before, after, value } = fullLink;
	return `${before}${value}${after}`;
}
