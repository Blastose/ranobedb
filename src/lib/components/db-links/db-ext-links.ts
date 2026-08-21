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
	name: 'BookWalker',
};

export const bookwalkerAuthorLink: LinkBeforeAfter = {
	before: 'https://bookwalker.jp/author/',
	after: '',
	name: 'BookWalker',
};

export const bookwalkerGlobalAuthorLink: LinkBeforeAfter = {
	before: 'https://bookwalker.com/browse?filter.contributor[]=',
	after: '',
	name: 'BookWalker Global',
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

export function getDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return '';
	}
}

export function faviconUrl(domain: string): string {
	return `/external-links/favicon?domain=${domain}`;
}

export function flagUrl(code: string): string {
	return `/external-links/flag?code=${code}`;
}

// Override domains for favicon lookup to avoid caching for similar domains (e.g. amazon.co.jp, amazon.com, etc.)
export const faviconDomains: Record<string, string | undefined> = {
	Amazon: 'www.amazon.com',
};

export const linkColors: Record<string, string | undefined> = {
	Twitter: '29, 161, 242',
	Amazon: '255, 153, 0',
	Rakuten: '191, 0, 0',
	BookWalker: '50, 162, 253',
	'BookWalker Global': '20, 120, 255',
	AniDB: '180, 125, 10',
	MyAnimeList: '66, 133, 255',
	Anilist: '20, 169, 255',
	Pixiv: '0, 150, 250',
	Syosetu: '90, 200, 248',
	Kakuyomu: '33, 150, 243',
	Bluesky: '0, 133, 255',
	Alphapolis: '225, 140, 0',
	Wikidata: '0, 142, 153',
	Website: '115, 125, 255',
};
