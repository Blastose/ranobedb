import { DateNumber } from '$lib/components/form/release/releaseDate';
import {
	booksSortArray,
	dbItemArray,
	historyFilterChangeType,
	historyFilterVisibilitys,
	logicalOps,
	publisherTabs,
	releasePublisherTypeArray,
	releaseTypeArray,
	seriesBookTypeArray,
	seriesRelTypeArray,
	seriesSortArray,
	seriesStatusArray,
	settingsTabs,
	staffRolesArray,
	staffTabs,
} from '$lib/db/dbConsts';
import { releaseFormatArray } from '$lib/db/dbConsts';
import { publisherRelTypeArray } from '$lib/db/dbConsts';
import { languagesArray } from '$lib/db/dbConsts';
import { z } from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { defaultUserListLabelsArray } from '$lib/db/dbConsts';

dayjs.extend(customParseFormat);

const maxTextLength = 2000;
const maxNumberValue = 2147483647;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const zUsername = z
	.string({ required_error: 'Username is required' })
	.regex(
		USERNAME_REGEX,
		'Username must only contain alphanumeric characters, dash (-), and underscore (_)',
	)
	.min(3, { message: 'Username must be between 3 and 36 characters' })
	.max(36, { message: 'Username must be between 3 and 36 characters' });
const zPasswordEntry = z
	.string({ required_error: 'Password is required' })
	.max(255, { message: 'Password too long' });
const zPasswordNew = z
	.string({ required_error: 'Password is required' })
	.min(6, { message: 'Password must be between 6 and 255 characters' })
	.max(255, { message: 'Password must be between 6 and 255 characters' });

function isValidISO8601Date(dateString: string): boolean {
	const isoDateRegex = /^\d{4,5}-\d{2}-\d{2}$/;
	if (!isoDateRegex.test(dateString)) {
		return false;
	}

	const [year, month, day] = dateString.split('-').map((v) => Number(v));
	if (month < 1 || month > 12 || day < 1) {
		return false;
	}
	const daysInMonth = new Date(year, month, 0).getDate();
	return day <= daysInMonth;
}
export const zISODate = z
	.string()
	.refine((v) => isValidISO8601Date(v), { message: 'Date must be a valid ISO date' });

export const loginSchema = z.object({
	usernameemail: z
		.string({ required_error: 'Username or email is required' })
		.max(255, { message: 'Username or email too long' }),
	password: zPasswordEntry,
});

export const forgotPasswordSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
});

export const resetPasswordSchema = z
	.object({
		password: zPasswordNew,
		confirm_password: zPasswordNew,
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Passwords do not match',
		path: ['confirm_password'],
	});

export const signupSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
	username: zUsername,
	password: zPasswordNew,
});

export const verifyEmailSchema = z.object({
	code: z.string().min(8).max(8),
});

export const sendEmailVerificationSchema = z.object({
	password: zPasswordEntry,
});

export const changeEmailSchema = z.object({
	current_email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
	new_email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
	password: zPasswordEntry,
});

export const usernameSchema = z.object({ username: zUsername, password: zPasswordEntry });
export const passwordSchema = z.object({
	currentPassword: zPasswordEntry,
	newPassword: zPasswordNew,
});

export const emptySchema = z.object({});

const userListFormTypes = ['add', 'update', 'delete'] as const;
export type UserListFormType = (typeof userListFormTypes)[number];
export const userListBookSchema = z.object({
	labels: z.array(
		z.object({
			id: z.number().max(2000000),
			label: z.string().max(2000),
		}),
	),
	readingStatus: z.enum(defaultUserListLabelsArray),
	score: z.number().min(1).max(10).nullish(),
	started: zISODate.or(z.literal('')).nullish(),
	finished: zISODate.or(z.literal('')).nullish(),
	notes: z
		.string()
		.trim()
		.max(2000, { message: 'Note must between less than 2000 characters' })
		.nullish(),
	type: z.enum(userListFormTypes),
});

const zRomaji = z
	.string()
	.trim()
	.max(maxTextLength, { message: `Romaji must be at most ${maxTextLength} characters` })
	.nullish()
	.transform((v) => v || null)
	.nullish();

const zDescription = z
	.string()
	.trim()
	.max(maxTextLength, { message: `Description must be at most ${maxTextLength} characters` })
	.nullish();

const zComment = z
	.string()
	.trim()
	.min(1, { message: 'Summary must have at least 1 character' })
	.max(maxTextLength);

const zTitles = z
	.array(
		z.object({
			lang: z.enum(languagesArray),
			official: z.boolean(),
			title: z
				.string()
				.trim()
				.min(1, { message: 'Title must be at least 1 character' })
				.max(2000, { message: 'Title must be at most 2000 characters' }),
			romaji: zRomaji,
		}),
	)
	.min(1, { message: 'There needs to be at least 1 title' })
	.max(50, { message: 'The total number of titles must be less than 50' })
	.refine(
		(titles) => {
			if (!titles.some((v) => v.lang === 'ja')) {
				return false;
			}
			return true;
		},
		{ message: 'A Japanese title must be included' },
	);

const zReleaseDate = z
	.number()
	.min(10000101)
	.max(99999999)
	.default(99999999)
	.refine(
		(val) => {
			const dateNumber = new DateNumber(val);
			if (dateNumber.isFullDate()) {
				return dayjs(dateNumber.getDateFormatted(), 'YYYY-MM-DD', true).isValid();
			}

			const { month, day } = dateNumber.extractYearMonthDay();
			if (month > 12 && month !== 99) {
				return false;
			}
			if (month === 99 && day !== 99) {
				return false;
			}
			if (day > 31 && day !== 99) {
				return false;
			}

			return true;
		},
		{ message: 'Release date must have correct format.' },
	);

const zLink = (validHostnames: string[]) =>
	z
		.string()
		.max(maxTextLength)
		.trim()
		.transform((v) => (v === '' ? null : v))
		.refine(
			(v) => {
				if (v === null) return true;
				try {
					const url = new URL(v);
					if (validHostnames.length === 0) {
						return true;
					}
					if (validHostnames.includes(url.hostname)) {
						return true;
					}
					return false;
				} catch {
					return false;
				}
			},
			{
				message: `Invalid url${validHostnames.length > 0 ? `; Url must be one of ${validHostnames.join(', ')}` : ``}`,
			},
		)
		.nullish();

export const bookSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),
	description: zDescription,
	description_ja: zDescription,
	image_id: z.number().max(2000000).nullish(),
	olang: z.enum(languagesArray),

	titles: zTitles,

	editions: z
		.array(
			z.object({
				eid: z.number().min(0).max(2000000).nullish(),
				title: z
					.string()
					.trim()
					.min(1, { message: 'Title must be at least 1 character' })
					.max(2000, { message: 'Title must be at most 2000 characters' }),
				lang: z.enum(languagesArray).nullish(),
				staff: z
					.array(
						z.object({
							name: z.string().max(2000).nullish(),
							romaji: z.string().max(2000).nullish(),
							staff_id: z.number().max(2000000),
							staff_alias_id: z.number().max(2000000),
							role_type: z.enum(staffRolesArray),
							note: z
								.string()
								.trim()
								.max(2000, { message: 'Note must be at most 2000 characters' }),
						}),
					)
					.max(50),
			}),
		)
		.min(1, { message: 'There must be at least 1 edition' })
		.max(10, { message: 'The total number of editions must be less than or equal to 10' })
		.refine(
			(editions) => {
				const originalEdition = editions.at(0);
				if (!originalEdition) {
					return false;
				}
				if (originalEdition.title !== 'Original edition') {
					return false;
				}
				if (originalEdition.lang !== null) {
					return false;
				}
				return true;
			},
			{ message: 'Original edition must be first and lang must be null' },
		)
		.refine(
			(editions) => {
				for (let i = 1; i < editions.length; i++) {
					const edition = editions[i];
					if (edition.title.toLowerCase() === 'Original edition'.toLowerCase()) {
						return false;
					}
					if (edition.lang === null) {
						return false;
					}
				}
				return true;
			},
			{ message: "Cannot name other editions 'Original edition'" },
		),

	release_date: zReleaseDate,

	comment: zComment,
});

export const staffSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),
	description: zDescription,
	bookwalker_id: z.number().max(maxNumberValue).nullish(),
	pivix_id: z.number().max(maxNumberValue).nullish(),
	twitter_id: z.string().trim().max(2000).nullish(),
	website: zLink([]),
	wikidata_id: z.number().max(maxNumberValue).nullish(),

	aliases: z
		.array(
			z.object({
				aid: z.number().max(2000000).nullish(),
				ref_book_id: z.number().max(2000000).nullish(),
				main_alias: z.boolean(),
				name: z.string().trim().min(1, { message: 'Name must be at least 1 character' }).max(2000),
				romaji: zRomaji,
			}),
		)
		.min(1, { message: 'There must be at least 1 alias' })
		.max(50, { message: 'The number of aliases must be less than or equal to 50' })
		.refine((staffs) => {
			const countMainAlias = staffs.filter((item) => item.main_alias).length;
			if (countMainAlias !== 1) {
				return false;
			}
			return true;
		}),
	comment: zComment,
});

export const publisherSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),

	name: z.string().trim().max(2000),
	romaji: zRomaji,
	description: zDescription,
	bookwalker: zLink(['bookwalker.jp', 'global.bookwalker.jp']),

	child_publishers: z
		.array(
			z.object({
				name: z.string().trim(),
				romaji: z.string().trim().nullish(),
				id: z.number().max(100000),
				relation_type: z.enum(publisherRelTypeArray),
			}),
		)
		.max(50, { message: 'The number of publishers must be less than or equal to 50' }),

	twitter_id: z.string().trim().max(maxTextLength).nullish(),
	website: zLink([]),
	wikidata_id: z.number().max(maxNumberValue).nullish(),

	comment: zComment,
});

export const releaseSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),

	title: z.string().trim().max(2000),
	romaji: zRomaji,
	description: zDescription,

	format: z.enum(releaseFormatArray),
	lang: z.enum(languagesArray),
	release_date: zReleaseDate,
	pages: z.number().min(1).max(200000).nullish(),
	isbn13: z
		.string()
		.trim()
		.min(13, { message: 'ISBN must be 13 characters' })
		.max(13, { message: 'ISBN must be 13 characters' })
		.nullish()
		.or(z.literal(''))
		.transform((v) => (v === '' ? null : v)),

	amazon: zLink(['www.amazon.co.jp', 'www.amazon.com']),
	bookwalker: zLink(['bookwalker.jp', 'global.bookwalker.jp']),
	rakuten: zLink(['books.rakuten.co.jp']),
	website: zLink([]),

	books: z
		.array(
			z.object({
				id: z.number().max(200000),
				title: z.string().nullish(),
				romaji: z.string().nullish(),
				lang: z.enum(languagesArray).nullish(),
				rtype: z.enum(releaseTypeArray),
			}),
		)
		.max(50, { message: 'The number of books must be less than or equal to 50' }),
	publishers: z
		.array(
			z.object({
				id: z.number().max(200000),
				name: z.string(),
				romaji: z.string().nullish(),
				publisher_type: z.enum(releasePublisherTypeArray),
			}),
		)
		.max(50, { message: 'The number of publishers must be less than or equal to 50' }),

	comment: zComment,
});

export const seriesSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),

	description: zDescription,
	bookwalker_id: z.number().max(20000000).nullish(),
	publication_status: z.enum(seriesStatusArray),
	aliases: z
		.string()
		.trim()
		.max(2000)
		.transform((v) =>
			v
				.split('\n')
				.map((v) => v.trim())
				.join('\n'),
		)
		.nullish(),
	olang: z.enum(languagesArray),
	anidb_id: z.number().max(maxNumberValue).nullish(),
	start_date: zReleaseDate,
	end_date: zReleaseDate,
	web_novel: zLink(['kakuyomu.jp', 'ncode.syosetu.com']),
	wikidata_id: z.number().max(maxNumberValue).nullish(),

	books: z
		.array(
			z.object({
				title: z.string().nullish(),
				romaji: z.string().nullish(),
				lang: z.enum(languagesArray).nullish(),
				id: z.number().max(100000),
				book_type: z.enum(seriesBookTypeArray),
				sort_order: z.number().max(2000),
			}),
		)
		.max(200, { message: 'The total number of books must be less than or equal to 200' })
		.refine(
			(v) => {
				const vSet = new Set(v.map((vv) => vv.sort_order));
				return vSet.size === v.length;
			},
			{
				message: 'Cannot have same sort orders for books',
			},
		),
	child_series: z
		.array(
			z.object({
				title: z.string().nullish(),
				romaji: z.string().nullish(),
				lang: z.enum(languagesArray).nullish(),
				id: z.number().max(100000),
				relation_type: z.enum(seriesRelTypeArray),
			}),
		)
		.max(200, { message: 'The total number of related series must be less than or equal to 200' }),
	titles: zTitles,

	comment: zComment,
});

const zLanguagePrio = z.object({
	lang: z.enum(languagesArray),
	romaji: z.boolean(),
});
export type LanguagePriority = z.infer<typeof zLanguagePrio>;

export const displayPrefsSchema = z.object({
	title_prefs: z.array(zLanguagePrio).min(1).max(4),
	names: z.enum(['romaji', 'native'] as const),
	descriptions: z.enum(['en', 'ja'] as const),
});
export type DisplayPrefs = z.infer<typeof displayPrefsSchema>;

// Url searchparams schemas
export const historyFiltersSchema = z.object({
	items: z
		.array(z.enum(dbItemArray))
		.max(dbItemArray.length)
		.default(dbItemArray.map((v) => v)),
	change_type: z.enum(historyFilterChangeType),
	visibility: z.enum(historyFilterVisibilitys),
	hide_automated: z.boolean().nullish(),
});
export type HistoryFilters = z.infer<typeof historyFiltersSchema>;

export const bookFiltersSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	sort: z.enum(booksSortArray).catch('Title asc'),
});

export const seriesFiltersSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	sort: z.enum(seriesSortArray).catch('Title asc'),
});

export const searchNameSchema = z.object({ name: z.string().max(maxTextLength).trim() });
export const tokenSchema = z.object({ token: z.string().max(maxTextLength).nullish() });
export const redirectSchema = z.object({ redirect: z.string().max(maxTextLength).nullish() });
export const revisionSchema = z.object({ revision: z.number().max(maxNumberValue).nullish() });
export const languageSchema = z.object({ lang: z.enum(languagesArray).nullish() });
export const listLabelsSchema = z.object({ l: z.array(z.number().max(maxNumberValue)).max(20) });
export const staffTabsSchema = z.object({ tab: z.enum(staffTabs).catch(staffTabs[0]) });
export const publisherTabsSchema = z.object({ tab: z.enum(publisherTabs).catch(publisherTabs[0]) });
export const settingsTabsSchema = z.object({ view: z.enum(settingsTabs).catch(settingsTabs[0]) });
export const pageSchema = z.object({
	page: z.number().positive().max(maxNumberValue).catch(1),
});
export const qSchema = z.object({
	q: z.string().max(maxTextLength).trim().nullish().catch(null),
});

export type Nullish<T> = T | null | undefined;
