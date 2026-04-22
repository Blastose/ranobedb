import { JSDOM } from 'jsdom';
import { z } from 'zod/v4';
import { fullToHalf } from '../char-conversion';
import { filter } from './filter-bw-titles';
import type { Nullish } from '$lib/server/zod/schema';
import type { StaffRole } from '$lib/server/db/dbTypes';
import { staffRolesArray } from '$lib/db/dbConsts';

const zStaffRole = z.enum(staffRolesArray).catch('staff');

const zBwBook = z.object({
	id: z.string(),
	url: z.string(),
	title: z.string(),
	series: z
		.object({
			name: z.string(),
			url: z.string().nullish(),
			id: z.number(),
		})
		.nullish(),
	publisher: z
		.object({
			name: z.string().nullish(),
			url: z.string().nullish(),
			id: z.number().nullish(),
		})
		.nullish(),
	label: z
		.object({
			name: z.string().nullish(),
			url: z.string().nullish(),
			id: z.number().nullish(),
		})
		.nullish(),
	staff: z.array(
		z.object({
			name: z.string(),
			role_type: zStaffRole,
			note: z.string().nullish(),
			url: z.string().nullish(),
			id: z.number(),
		}),
	),
	category: z.string().nullish(),
	date: z.string(),
	dateNumber: z.number().min(10000000).max(99999999),
	teihonDate: z.string().nullish(),
	teihonDateNumber: z.number().min(10000000).max(99999999).nullish(),
	imageSrc: z.string().nullish(),
	description: z.string().nullish(),
	pages: z.number().nullish(),
	tags: z.array(z.string()),
	kana: z.string().nullish(),
});

type BwStaff = {
	name: string;
	role_type: StaffRole;
	note: string | null;
	url: string | null;
	id: number;
};
function parseOneStaff(staff: { text: string; url: string | null }): BwStaff[] {
	const matches = staff.text.match(/^(.*)\((.*?)\)$/);
	let name = staff.text;
	let role_type = 'author';
	let note = null;

	const ps: BwStaff[] = [];

	if (matches) {
		name = matches[1];
		role_type = matches[2];

		if (
			role_type === '著者' ||
			role_type === '著' ||
			role_type === '小説' ||
			role_type === '原作・監修・著' ||
			role_type === '著・脚本' ||
			role_type === 'Author' ||
			role_type === '共著' ||
			role_type === '執筆' ||
			role_type === '文' ||
			role_type === '著・原作' ||
			role_type === '著作' ||
			role_type === '作'
		) {
			role_type = 'author';
		} else if (
			role_type === 'イラスト' ||
			role_type === 'イラストレータ' ||
			role_type === 'イラストレーター' ||
			role_type === '画' ||
			role_type === '本文イラスト' ||
			role_type === '口絵・本文イラスト' ||
			role_type === 'カバー・本文イラスト' ||
			role_type === 'キャラクターデザイン・イラスト' ||
			role_type === 'イラスト・企画' ||
			role_type === 'モノクロ挿絵' ||
			role_type === '絵' ||
			role_type === '作画' ||
			role_type === '挿画' ||
			role_type === '口絵イラスト' ||
			role_type === '原案/カバー・口絵・本文イラスト' ||
			role_type === 'イラスト／メカデザイン' ||
			role_type === 'イラスト・絵' ||
			role_type === 'キャラクター原作・イラスト' ||
			role_type === 'デザイン監修・イラスト' ||
			role_type === 'モノクロイラスト' ||
			role_type === '挿絵' ||
			role_type === '本文挿絵' ||
			role_type === '著イラスト' ||
			role_type === '装丁・登場人物紹介イラスト' ||
			role_type === 'イラスト＆コミック' ||
			role_type === 'イラストレーション' ||
			role_type === 'カラーイラスト' ||
			role_type === 'カバー・挿絵' ||
			role_type === '挿絵イラスト' ||
			role_type === '原案・絵' ||
			role_type === 'キャラクターデザイン＆イラスト' ||
			role_type === 'キャラクター原案・本文イラスト' ||
			role_type === 'メカニックデザイン＆イラスト'
		) {
			role_type = 'artist';
		} else if (role_type === '世界観イラスト') {
			note = 'Background artist';
			role_type = 'artist';
		} else if (
			role_type === 'キャラクターデザイン' ||
			role_type === 'キャラクター原案' ||
			role_type === 'キャラクター原案・漫画' ||
			role_type === 'キャラクターデザイン協力' ||
			role_type === '原作キャラクターデザイン' ||
			role_type === 'メインキャラクターデザイン' ||
			role_type === '新キャラクターデザイン' ||
			role_type === '新ナイトメアデザイン' ||
			role_type === 'キャラクター原案／デザイン'
		) {
			role_type = 'artist';
			note = 'Character design';
		} else if (
			role_type === 'カバーイラスト' ||
			role_type === 'カバー・口絵イラスト' ||
			role_type === '装画' ||
			role_type === 'カバー絵' ||
			role_type === '表紙イメージアート' ||
			role_type === '表紙イラスト' ||
			role_type === 'カバー' ||
			role_type === 'カバーイラスト制作'
		) {
			role_type = 'artist';
			note = 'Cover artist';
		} else if (
			role_type === '監修' ||
			role_type === '編' ||
			role_type === '編集' ||
			role_type === '企画・編集' ||
			role_type === '全体監修' ||
			role_type === '監修・オリジナルストーリー原案' ||
			role_type === '監修・協力' ||
			role_type === '編者' ||
			role_type === '編集協力' ||
			role_type === '総合監修' ||
			role_type === '総監修' ||
			role_type === '企画・編集'
		) {
			role_type = 'editor';
		} else if (role_type === 'クリーチャーデザイン') {
			role_type = 'artist';
			note = 'Creature design';
		} else if (role_type === 'シナリオ') {
			role_type = 'author';
			note = 'Scenario';
		} else if (role_type === 'その他' || role_type === 'その他著者') {
			role_type = 'staff';
			note = 'Other';
		} else if (role_type === 'ノベライズ') {
			role_type = 'author';
			note = 'Novelization';
		} else if (
			role_type === 'メカニックデザイン' ||
			role_type === 'メカデザイン' ||
			role_type === 'メカニックイラスト' ||
			role_type === 'ロボ作劇／メカデザイン'
		) {
			role_type = 'artist';
			note = 'Mechanical design';
		} else if (role_type === 'シリーズ構成・脚本・ストーリーディレクタ') {
			role_type = 'staff';
			note = 'Director';
		} else if (role_type === 'レシピ監修') {
			role_type = 'staff';
			note = 'Recipe supervisor';
		} else if (
			role_type === '監修協力' ||
			role_type === '監督' ||
			role_type === '監督・脚本構成' ||
			role_type === '監督・原案'
		) {
			role_type = 'staff';
			note = 'Supervisor';
		} else if (
			role_type === '原作・イラスト' ||
			role_type === '絵・原作' ||
			role_type === '原作・監修・イラスト' ||
			role_type === 'イラスト・原作' ||
			role_type === '原案・イラスト' ||
			role_type === '原案・監修・イラスト' ||
			role_type === '原作イラスト' ||
			role_type === 'イラスト，原作'
		) {
			role_type = 'artist';
			note = 'Original work';
		} else if (
			role_type === '原作・監修' ||
			role_type === '原案' ||
			role_type === '原案・監修' ||
			role_type === '原作' ||
			role_type === '原作・プロデュース' ||
			role_type === '監・案' ||
			role_type === '企画・原作' ||
			role_type === '企画・原作・制作' ||
			role_type === 'Original Work' ||
			role_type === '企画／原作／カバーイラスト' ||
			role_type === '企画・原案' ||
			role_type === '原作／漫画' ||
			role_type === '原作・その他' ||
			role_type === '原作・原案' ||
			role_type === '原作・原案協力' ||
			role_type === '原作・脚本・キャラクターデザイン' ||
			role_type === '監・原作' ||
			role_type === '総監督/原案・シリーズ構成' ||
			role_type === '原作・ストーリー協力' ||
			role_type === '原著' ||
			role_type === '原作・絵' ||
			role_type === 'ご本家'
		) {
			role_type = 'staff';
			note = 'Original work';
		} else if (
			role_type === '脚本' ||
			role_type === '劇場版脚本' ||
			role_type === '原作・脚本' ||
			role_type === 'ストーリー' ||
			role_type === 'ストーリー原案' ||
			role_type === 'ストーリー構成'
		) {
			role_type = 'staff';
			note = 'Script';
		} else if (
			role_type === '著者・イラスト' ||
			role_type === '作・絵' ||
			role_type === '著・イラスト' ||
			role_type === '著・イラスト・原作' ||
			role_type === '著者・イラスト・漫画' ||
			role_type === '著・絵'
		) {
			role_type = 'artist';
			ps.push({
				name: fullToHalf(name),
				role_type: zStaffRole.parse(role_type),
				note,
				url: staff.url,
				id: extractBwIdFromUrl(staff.url ?? ''),
			});
			role_type = 'author';
		} else if (
			role_type === 'まんが' ||
			role_type === '漫画' ||
			role_type === 'コミック' ||
			role_type === 'マンガ'
		) {
			role_type = 'staff';
			note = 'Manga';
		} else if (role_type === 'イラスト・漫画') {
			role_type = 'artist';
			note = 'Manga';
		} else if (role_type === '協力' || role_type === '制作協力') {
			role_type = 'staff';
			note = 'Help';
		} else if (role_type === '翻訳' || role_type === '訳' || role_type === '訳者') {
			role_type = 'translator';
		} else if (role_type === '映画脚本') {
			role_type = 'staff';
			note = 'Movie script';
		} else if (role_type === '執筆協力') {
			role_type = 'staff';
			note = 'Writing help';
		} else if (role_type === '原曲') {
			role_type = 'staff';
			note = 'Original song';
		} else if (role_type === '原作ゲーム') {
			role_type = 'staff';
			note = 'Original game';
		} else if (
			role_type === '企画' ||
			role_type === '企画・制作' ||
			role_type === '企画' ||
			role_type === '企画原案' ||
			role_type === '監' ||
			role_type === '主犯'
		) {
			role_type = 'staff';
			note = 'Production';
		} else if (role_type === '監・写真' || role_type === '撮影') {
			role_type = 'staff';
			note = 'Photos';
		} else if (role_type === 'Founder') {
			role_type = 'staff';
			note = 'Founder';
		} else if (role_type === 'イラスト・その他') {
			role_type = 'artist';
			note = 'Other';
		} else if (role_type === 'ゲームデザイン' || role_type === 'ゲーム原案') {
			role_type = 'staff';
			note = 'Game design';
		} else if (role_type === '写真') {
			role_type = 'staff';
			note = 'Photos';
		} else if (role_type === '翻訳監修') {
			role_type = 'staff';
			note = 'Translation supervisor';
		} else if (role_type === '脚本・監督') {
			role_type = 'staff';
			note = 'Script';
		} else if (role_type === '色彩設計') {
			role_type = 'staff';
			note = 'Color scheme';
		} else if (role_type === '解説') {
			role_type = 'staff';
			note = 'Commentary';
		} else if (role_type === 'コンセプトデザイン' || role_type === 'ヴィジュアルコンセプト') {
			role_type = 'staff';
			note = 'Concept design';
		} else if (role_type === 'プロデュース' || role_type === '構成') {
			role_type = 'staff';
			note = 'Producer';
		} else if (role_type === '版権') {
			role_type = 'staff';
			note = 'Copyright';
		} else if (role_type === '脚注・設定監修・地図作成') {
			role_type = 'staff';
			note = 'Mapping';
		} else if (role_type === '出演') {
			role_type = 'staff';
			note = 'Appearance';
		} else {
			note = 'unknown role';
		}
	}

	return [
		{
			name: fullToHalf(name),
			role_type: zStaffRole.parse(role_type),
			note,
			url: staff.url,
			id: extractBwIdFromUrl(staff.url ?? ''),
		},
		...ps,
	];
}
function parseStaff(
	strs: {
		text: string;
		url: string | null;
	}[],
): BwStaff[] {
	const staff: BwStaff[] = [];

	for (const str of strs) {
		staff.push(...parseOneStaff(str));
	}

	return staff;
}

function formatMonthDay(md: string) {
	if (md.length === 1) {
		return `0${md}`;
	}
	return md;
}
function parseBwDate(date: string | null) {
	if (!date) return null;
	const dateSplit = date.split('/');
	let year, month, day;
	if (dateSplit.length === 2) {
		[year, month] = dateSplit;
		day = '99';
	} else {
		[year, month, day] = dateSplit;
	}

	return `${year}-${formatMonthDay(month)}-${formatMonthDay(day)}`;
}

function convertDateToDateNumber(date: string): number;
function convertDateToDateNumber(date: null): null;
function convertDateToDateNumber(date: string | null): number | null;
function convertDateToDateNumber(date: string | null): number | null {
	if (!date) return null;
	return parseInt(date.split('-').join('') ?? '');
}

function formatCaption(str: Element | null): string {
	if (str) {
		return `${str.textContent?.trim()}\n\n`;
	} else {
		return '';
	}
}

function extractBwIdFromUrl(url: string) {
	return Number(url.split('/')[4]);
}

export function scrapeBW(text: string) {
	const window = new JSDOM(`...`).window;
	const parser = new window.DOMParser();
	const dom = parser.parseFromString(text, 'text/html');

	if (!dom) throw new Error('Could not parse text/html of page');
	const japanOnlyEl = dom.querySelector('p.t-c-detail-error__text');
	if (japanOnlyEl?.textContent?.includes('この作品は、日本国内のみでの販売となります。')) {
		throw new Error('Japan only');
	}

	const caption = dom.querySelector('p.t-c-product-synopsis-main__excerpt');
	const summary = dom.querySelector('div.t-c-product-synopsis-main__content');
	const description = `${formatCaption(caption)}${summary?.textContent?.trim() ?? ''}` || null;

	const staffInfo = dom.querySelector('ul.t-c-detail-about-information__list');
	const staffAElements = staffInfo?.querySelectorAll('li > a');
	let staff: BwStaff[] = [];
	if (staffAElements) {
		const staffText = [];
		for (const a of staffAElements) {
			staffText.push({
				text: a.textContent?.trim() ?? '',
				url: (a as Element).getAttribute('href'),
			});
		}
		staff = parseStaff(staffText);
	}

	const genreTags = dom.querySelectorAll('li.t-o-tag-label');
	const tags: string[] = [];
	for (const t of genreTags) {
		const tt = t.textContent?.trim();
		if (tt) {
			tags.push(tt);
		}
	}

	const dtElements = dom.querySelectorAll('dt');
	let haishinkaishi = null;
	let teihonhakkoubi = null;
	const label: {
		url: Nullish<string>;
		name: Nullish<string>;
		id: Nullish<number>;
	} = {
		url: null,
		name: null,
		id: null,
	};
	const publisher: {
		url: Nullish<string>;
		name: Nullish<string>;
		id: number;
	} = {
		url: null,
		name: null,
		id: -1,
	};
	let category: string | null = null;
	let seriesName: string | null = null;
	let seriesUrl: string | null = null;
	let pages: number | null = null;
	for (const dtEl of dtElements) {
		if (dtEl.textContent === '配信開始日') {
			const dd = dtEl.nextElementSibling;
			haishinkaishi = dd?.textContent ?? null;
		} else if (dtEl.textContent === '底本発行日') {
			const dd = dtEl.nextElementSibling;
			teihonhakkoubi = dd?.textContent ?? null;
		} else if (dtEl.textContent === '出版社') {
			const a = dtEl.nextElementSibling?.firstElementChild as Nullish<HTMLAnchorElement>;
			publisher.url = a?.href;
			if (!publisher.url) {
				throw new Error('Could not extract publisher URL from page');
			}
			publisher.id = extractBwIdFromUrl(publisher.url ?? '-1');
			publisher.name = a?.textContent;
		} else if (dtEl.textContent === 'レーベル') {
			const a = dtEl.nextElementSibling?.firstElementChild as Nullish<HTMLAnchorElement>;
			label.url = a?.href;
			if (!label.url) {
				throw new Error('Could not extract label URL from page');
			}
			label.id = extractBwIdFromUrl(label.url ?? '');
			label.name = a?.textContent;
		} else if (dtEl.textContent === 'カテゴリ') {
			category = dtEl.nextElementSibling?.textContent?.trim() ?? null;
		} else if (dtEl.textContent === 'シリーズ') {
			const a = dtEl.nextElementSibling?.firstElementChild as Nullish<HTMLAnchorElement>;
			seriesName = dtEl.nextElementSibling?.textContent?.trim() ?? null;
			seriesUrl = a?.href ?? null;
		} else if (dtEl.textContent === 'ページ概数') {
			pages = Number(dtEl.nextElementSibling?.firstElementChild?.textContent) || null;
		}
	}
	if (publisher?.url === label?.url) {
		label.name = null;
		label.id = null;
		label.url = null;
	}

	const goodCategories = ['ライトノベル', '新文芸', '文芸・小説', 'マンガ']; // TODO remove マンガ later
	if (category && !goodCategories.includes(category)) {
		throw new Error('Book category is not valid');
	}

	haishinkaishi = parseBwDate(haishinkaishi);
	if (!haishinkaishi) {
		throw new Error('Could not parse release date');
	}
	teihonhakkoubi = parseBwDate(teihonhakkoubi);

	const image = dom.querySelector(
		'img.t-o-thumbnail__img.js-lazy-load[src="https://yc.bookwalker.jp/bws/assets/img_loading_dummy-CAcfCgoO-6Gl.png"]',
	);
	const imageSrc = image?.getAttribute('data-lazy-src') ?? null;

	const kana = dom
		.querySelector("meta[name='keywords']")
		?.getAttribute('content')
		?.split(',')
		.at(1);

	const titleEl = dom.querySelector('h1.t-c-product-main-data__title');
	const title = titleEl?.textContent;
	if (!title) {
		throw new Error('No title found on page');
	}
	const idUrl = dom.querySelector("head > meta[property='og:url']")?.getAttribute('content');
	const id = idUrl?.replace('https://bookwalker.jp/de', '').replace('/', '');

	if (!id) {
		throw new Error('Could not parse ID from URL');
	}

	const url = `https://bookwalker.jp/de${id}/`;

	return zBwBook.parse({
		id: id,
		url,
		title: fullToHalf(filter(title)) ?? '',
		series: seriesName
			? {
					name: fullToHalf(filter(seriesName, publisher.name, label.name)),
					url: seriesUrl,
					id: extractBwIdFromUrl(seriesUrl ?? ''),
				}
			: null,
		category: category,
		date: haishinkaishi,
		dateNumber: convertDateToDateNumber(haishinkaishi),
		teihonDate: teihonhakkoubi,
		teihonDateNumber: convertDateToDateNumber(teihonhakkoubi),
		imageSrc,
		description,
		pages,
		tags,
		kana,
		publisher: { ...publisher, name: fullToHalf(publisher.name) },
		label: { ...label, name: fullToHalf(label.name) },
		staff: staff,
	} satisfies z.infer<typeof zBwBook>);
}
