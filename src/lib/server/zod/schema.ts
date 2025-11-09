import { DateNumber, DateNumberGenerator } from '$lib/components/form/release/releaseDate';
import {
	booksUserListSortArray,
	dbItemArray,
	defaultUserListLabelsArrayAndRemove,
	historyFilterChangeType,
	historyFilterVisibilitys,
	logicalOps,
	publisherTabs,
	releasePublisherTypeArray,
	releaseSortArray,
	releaseTypeArray,
	seriesBookTypeArray,
	seriesRelTypeArray,
	seriesStatusArray,
	seriesUserListSortArray,
	settingsTabs,
	staffRolesArray,
	staffTabs,
	tagTypeArray,
	userListReleaseStatus,
	userListStatus,
} from '$lib/db/dbConsts';
import { releaseFormatArray } from '$lib/db/dbConsts';
import { publisherRelTypeArray } from '$lib/db/dbConsts';
import { languagesArray } from '$lib/db/dbConsts';
import { z } from 'zod/v4';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { defaultUserListLabelsArray } from '$lib/db/dbConsts';

dayjs.extend(customParseFormat);

const maxTextLength = 2000;
const maxNumberValue = 2147483647;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const zUsername = z
	.string({
		error: (issue) =>
			issue.input === undefined ? 'Username is required' : 'Username is not a string',
	})
	.regex(
		USERNAME_REGEX,
		'Username must only contain alphanumeric characters, dash (-), and underscore (_)',
	)
	.min(3, { message: 'Username must be between 3 and 20 characters' })
	.max(20, { message: 'Username must be between 3 and 20 characters' });
const zPasswordEntry = z
	.string({
		error: (issue) =>
			issue.input === undefined ? 'Password is required' : 'Password is not a string',
	})
	.max(255, { message: 'Password too long' });
const zPasswordNew = z
	.string({
		error: (issue) =>
			issue.input === undefined ? 'Password is required' : 'Password is not a string',
	})
	.min(15, { message: 'Password must be between 15 and 255 characters' })
	.max(255, { message: 'Password must be between 15 and 255 characters' });

const zUserScore = z.coerce.number().min(1).max(10).multipleOf(0.1).nullish();

export const loginSchema = z.object({
	usernameemail: z
		.string({
			error: (issue) =>
				issue.input === undefined
					? 'Username or email is required'
					: 'Username or email is not a string',
		})
		.max(255, { message: 'Username or email too long' }),
	password: zPasswordEntry,
});

export const forgotPasswordSchema = z.object({
	email: z
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

export const signupSchema = z
	.object({
		email: z
			.email({ message: 'Invalid email address' })
			.max(255, { message: 'Email must be less or equal to 255 characters' }),
		username: zUsername,
		password: zPasswordNew,
		confirm_password: zPasswordNew,
		privacy_policy_cla: z
			.literal(true, {
				error: (issue) => {
					if (issue.code === 'invalid_value') {
						return 'You must agree in order to create an account';
					}
				},
			})
			.default(false as true),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Passwords do not match',
		path: ['confirm_password'],
	});

export const verifyEmailSchema = z.object({
	code: z.string().min(8).max(8),
});

export const sendEmailVerificationSchema = z.object({
	password: zPasswordEntry,
});

export const changeEmailSchema = z.object({
	current_email: z
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
	new_email: z
		.email({ message: 'Invalid email address' })
		.max(255, { message: 'Email must be less or equal to 255 characters ' }),
	password: zPasswordEntry,
});

export const profilePictureSchema = z.object({
	current_filename: z.string().max(255).nullish(),
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 3_000_000, 'Max 3 MB upload size.'),
	// .refine(async (f) => {
	// 	console.log(f);
	// 	console.log(f.bytes);
	// 	const blob = await f.bytes();
	// 	const { height, width } = imageSize(new Uint8Array(blob));
	// 	if (!height || !width) {
	// 		return false;
	// 	}
	// 	if (height > 10000 || width > 10000) {
	// 		return false;
	// 	}

	// 	return true;
	// }, 'Image dimensions must be less than 10000 x 10000')
});
export const removeProfilePictureSchema = z.object({
	current_filename: z.string().max(255).nullish(),
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
	selectedCustLabels: z.array(z.number().min(11).max(maxNumberValue)).max(2000),
	readingStatus: z.enum(defaultUserListLabelsArray),
	score: zUserScore,
	started: z.iso.date().or(z.literal('')).nullish(),
	finished: z.iso.date().or(z.literal('')).nullish(),
	notes: z
		.string()
		.trim()
		.max(2000, { message: 'Note must between less than 2000 characters' })
		.nullish(),
	type: z.enum(userListFormTypes),
});

export const userListBookBatchSchema = z.object({
	book_ids: z.array(z.number().min(1).max(maxNumberValue)).max(200),
	readingStatus: z.enum(defaultUserListLabelsArrayAndRemove),
	selectedCustLabels: z.array(z.number().min(11).max(maxNumberValue)).max(2000),
});

export const userReviewSchema = z.object({
	review_text: z
		.string()
		.trim()
		.min(100, { message: 'Review must contain at least 100 characters' })
		.max(10000),
	spoiler: z.boolean().default(false),
	score: zUserScore,
	volumes_read: z.number().min(1).max(maxNumberValue).nullish(),
	type: z.enum(userListFormTypes),
});

export const userListSeriesSettingsSchema = z.object({
	notify_book: z.boolean().default(true),
	notify_when_released: z.boolean().default(false),
	show_upcoming: z.boolean().default(true),
	langs: z.array(z.enum(languagesArray)),
	formats: z.array(z.enum(releaseFormatArray)),
	readingStatus: z.enum(defaultUserListLabelsArray),
});
export type UserListSeriesSettings = z.infer<typeof userListSeriesSettingsSchema>;

export const userListSeriesSchema = z.object({
	labels: z.array(
		z.object({
			id: z.number().max(2000000),
			label: z.string().max(2000),
		}),
	),
	notify_book: z.boolean().default(true),
	notify_when_released: z.boolean().default(false),
	show_upcoming: z.boolean().default(true),
	volumes_read: z.number().min(0).max(maxNumberValue).nullish(),
	// remove_all: z.boolean().default(false),
	selectedCustLabels: z.array(z.number().min(11).max(maxNumberValue)).max(2000),
	langs: z.array(z.enum(languagesArray)),
	formats: z.array(z.enum(releaseFormatArray)),
	readingStatus: z.enum(defaultUserListLabelsArray),
	score: zUserScore,
	started: z.iso.date().or(z.literal('')).nullish(),
	finished: z.iso.date().or(z.literal('')).nullish(),
	notes: z
		.string()
		.trim()
		.max(2000, { message: 'Note must between less than 2000 characters' })
		.nullish(),
	type: z.enum(userListFormTypes),
});

export const userListStaffSchema = z.object({
	notify_book: z.boolean().default(true),
	show_upcoming: z.boolean().default(true),
	only_first_book: z.boolean().default(true),
	langs: z.array(z.enum(languagesArray)),
	formats: z.array(z.enum(releaseFormatArray)),
	type: z.enum(userListFormTypes),
});

export const userListPublisherSchema = z.object({
	type: z.enum(userListFormTypes),
});

export const userListReleaseSchema = z.object({
	release_id: z.number(),
	release_status: z.enum(userListReleaseStatus),
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
			official: z.literal(true),
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

	c_release_date: zReleaseDate.nullish(),

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
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 10_000_000, 'Max 10 MB upload size.')
		// .refine(async (f) => {
		// 	console.log(f);
		// 	console.log(f.bytes);
		// 	const blob = await f.bytes();
		// 	const { height, width } = imageSize(new Uint8Array(blob));
		// 	if (!height || !width) {
		// 		return false;
		// 	}
		// 	if (height > 10000 || width > 10000) {
		// 		return false;
		// 	}

		// 	return true;
		// }, 'Image dimensions must be less than 10000 x 10000')
		.nullish(),
	image_id_manual: z.string().max(20).optional(),
	comment: zComment,
});

export const staffSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),
	description: zDescription,
	bookwalker_id: z.number().max(maxNumberValue).nullish(),
	bookwalker_gl_id: z.number().max(maxNumberValue).nullish(),
	pixiv_id: z.number().max(maxNumberValue).nullish(),
	twitter_id: z.string().trim().max(2000).nullish(),
	website: zLink([]),
	syosetu_id: z.number().max(maxNumberValue).nullish(),
	kakuyomu_id: z.string().trim().max(2000).nullish(),
	bsky_id: z.string().trim().max(2000).nullish(),
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
		.transform((v) =>
			v
				.replaceAll(/\u200e/g, '')
				.trim()
				.replaceAll('-', ''),
		)
		// Note, this doesn't show the errors because it's in the `.pipe`,
		// but zod doesn't let you do `.transform()` and then `.min()` and others
		.pipe(
			z
				.string()
				.min(13, { message: 'ISBN must be 13 characters' })
				.max(13, { message: 'ISBN must be 13 characters' })
				.regex(/[0-9]{13}/, { message: 'Invalid ISBN13 identifier' }),
		)
		.nullish()
		.or(z.literal(''))
		.transform((v) => (v === '' ? null : v))
		.optional(),
	amazon: zLink(['www.amazon.co.jp', 'www.amazon.com']),
	bookwalker: zLink([
		'bookwalker.jp',
		'global.bookwalker.jp',
		'www.bookwalker.com.tw',
		'bookwalker.in.th',
	]),
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
	c_start_date: zReleaseDate.nullish(),
	c_end_date: zReleaseDate.nullish(),
	c_latest_release_date: zReleaseDate.nullish(),
	web_novel: zLink(['kakuyomu.jp', 'ncode.syosetu.com', 'www.alphapolis.co.jp', 'www.pixiv.net']),
	website: zLink([]),
	wikidata_id: z.number().max(maxNumberValue).nullish(),
	mal_id: z.number().max(maxNumberValue).nullish(),
	anilist_id: z.number().max(maxNumberValue).nullish(),

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
	tags: z
		.array(
			z.object({
				id: z.number().max(maxNumberValue),
				name: z.string().max(maxTextLength).nullish(),
			}),
		)
		.max(200),

	comment: zComment,
});

const zLanguagePrio = z.object({
	lang: z.enum(languagesArray),
	romaji: z.boolean(),
});
export type LanguagePriority = z.infer<typeof zLanguagePrio>;

export const displayPrefsSchema = z.object({
	title_prefs: z
		.array(zLanguagePrio)
		.min(1, { message: 'You can need to have min 1 language ' })
		.max(10, { message: 'You can only have max 10 languages' }),
	names: z.enum(['romaji', 'native'] as const),
	descriptions: z.enum(['en', 'ja'] as const),
});
export type DisplayPrefs = z.infer<typeof displayPrefsSchema>;

export const userListLabelsSchema = z.object({
	labels: z
		.array(
			z.object({
				id: z.number().min(11).max(maxNumberValue).nullish(),
				label: z
					.string()
					.min(1, { message: 'Label name must contain at least 1 character' })
					.max(50),
				target: z.enum(['both', 'book', 'series']).default('both'),
				private: z.boolean(),
			}),
		)
		.max(50),
});

export const homeDisplaySettingsSchema = z.object({
	header: z.boolean().default(true),
	popular_series: z.boolean().default(true),
	reviews: z.boolean().default(true),
	upcoming_releases: z.boolean().default(true),
	recently_released: z.boolean().default(true),
	seasonal_anime: z.boolean().default(true),
	annoucements: z.boolean().default(true),
	recent_changes: z.boolean().default(true),
});
export type HomeDisplaySettings = z.infer<typeof homeDisplaySettingsSchema>;

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

const zQueryLimit = z.number().max(100).default(24);

export const queryLimitSchema = z.object({
	limit: zQueryLimit,
});

const zUserList = z.enum(userListStatus).catch('Any');

export const bookFiltersSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rlExclude: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	minDate: z.iso.date().or(z.literal('')).nullish(),
	maxDate: z.iso.date().or(z.literal('')).nullish(),
	sort: z.enum(booksUserListSortArray).catch('Relevance desc'),
	staff: z.array(z.number().max(maxNumberValue)).catch([]),
	sl: z.enum(logicalOps).catch('and'),
	p: z.array(z.number().max(maxNumberValue)).catch([]),
	pl: z.enum(logicalOps).catch('or'),
	limit: zQueryLimit,
	l: z.array(z.number().max(maxNumberValue)).max(100),
	list: zUserList,
});

const zStaff = z
	.array(
		z.object({
			id: z.number().max(maxNumberValue),
			name: z.string().max(maxTextLength),
			romaji: z.string().max(maxTextLength).nullish(),
		}),
	)
	.max(20);

const zPublishers = z
	.array(
		z.object({
			id: z.number().max(maxNumberValue),
			name: z.string().max(maxTextLength),
			romaji: z.string().max(maxTextLength).nullish(),
		}),
	)
	.max(20);

export const staffFilters = z.object({
	staff: zStaff,
});
export const publisherFilters = z.object({
	p: zPublishers,
});

export const staffPublisherFilters = z.object({
	...staffFilters.shape,
	...publisherFilters.shape,
	sl: z.enum(logicalOps).catch('and'),
	pl: z.enum(logicalOps).catch('or'),
});

export const bookFiltersObjSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rlExclude: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	minDate: z.iso.date().or(z.literal('')).nullish(),
	maxDate: z.iso.date().or(z.literal('')).nullish(),
	sort: z.enum(booksUserListSortArray).catch('Relevance desc'),
	staff: zStaff,
	sl: z.enum(logicalOps).catch('and'),
	p: zPublishers,
	pl: z.enum(logicalOps).catch('or'),
	l: z.array(z.number().max(maxNumberValue)).max(100),
	list: zUserList,
});

export const seriesFiltersSchema = z.object({
	minVolumes: z.number().max(maxNumberValue).nullish(),
	maxVolumes: z.number().max(maxNumberValue).nullish(),
	minStartDate: z.iso.date().or(z.literal('')).nullish(),
	maxStartDate: z.iso.date().or(z.literal('')).nullish(),
	minEndDate: z.iso.date().or(z.literal('')).nullish(),
	maxEndDate: z.iso.date().or(z.literal('')).nullish(),
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rlExclude: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	sort: z.enum(seriesUserListSortArray).catch('Relevance desc'),
	pubStatus: z.array(z.enum(seriesStatusArray)).catch([]),
	genresInclude: z.array(z.number().max(maxNumberValue)).catch([]),
	genresExclude: z.array(z.number().max(maxNumberValue)).catch([]),
	tagsInclude: z.array(z.number().max(maxNumberValue)).catch([]),
	tagsExclude: z.array(z.number().max(maxNumberValue)).catch([]),
	til: z.enum(logicalOps).catch('and'),
	tel: z.enum(logicalOps).catch('or'),
	staff: z.array(z.number().max(maxNumberValue)).catch([]),
	sl: z.enum(logicalOps).catch('and'),
	p: z.array(z.number().max(maxNumberValue)).catch([]),
	pl: z.enum(logicalOps).catch('or'),
	limit: zQueryLimit,
	l: z.array(z.number().max(maxNumberValue)).max(100),
	list: zUserList,
});

const zTags = z
	.array(
		z.object({
			id: z.number().max(maxNumberValue),
			name: z.string().max(maxTextLength),
			ttype: z.enum(tagTypeArray),
			mode: z.enum(['incl', 'excl'] as const),
		}),
	)
	.max(50)
	.catch([]);

export const seriesFiltersObjSchema = z.object({
	minVolumes: z.number().max(maxNumberValue).nullish(),
	maxVolumes: z.number().max(maxNumberValue).nullish(),
	minStartDate: z.iso.date().or(z.literal('')).nullish(),
	maxStartDate: z.iso.date().or(z.literal('')).nullish(),
	minEndDate: z.iso.date().or(z.literal('')).nullish(),
	maxEndDate: z.iso.date().or(z.literal('')).nullish(),
	rl: z.array(z.enum(languagesArray)).catch([]),
	rll: z.enum(logicalOps).catch('or'),
	rlExclude: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	rfl: z.enum(logicalOps).catch('or'),
	sort: z.enum(seriesUserListSortArray).catch('Relevance desc'),
	pubStatus: z.array(z.enum(seriesStatusArray)).catch([]),
	tags: zTags,
	til: z.enum(logicalOps).catch('and'),
	tel: z.enum(logicalOps).catch('or'),
	staff: zStaff,
	sl: z.enum(logicalOps).catch('and'),
	p: zPublishers,
	pl: z.enum(logicalOps).catch('or'),
	l: z.array(z.number().max(maxNumberValue)).max(100),
	list: zUserList,
});

export const releaseFiltersSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	minDate: z.iso.date().or(z.literal('')).nullish(),
	maxDate: z.iso.date().or(z.literal('')).nullish(),
	sort: z.enum(releaseSortArray).catch('Relevance desc'),
	p: z.array(z.number().max(maxNumberValue)).catch([]),
	pl: z.enum(logicalOps).catch('and'),
	limit: zQueryLimit,
	inUpcoming: z.boolean().default(false),
	onlyFirst: z.boolean().default(false),
	l: z.array(z.enum(userListReleaseStatus)).max(15),
	list: zUserList,
});
export const releaseFiltersObjSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	minDate: z.iso.date().or(z.literal('')).nullish(),
	maxDate: z.iso.date().or(z.literal('')).nullish(),
	sort: z.enum(releaseSortArray).catch('Relevance desc'),
	p: zPublishers,
	pl: z.enum(logicalOps).catch('or'),
	inUpcoming: z.boolean().default(false),
	onlyFirst: z.boolean().default(false),
	l: z.array(z.enum(userListReleaseStatus)).max(15),
	list: zUserList,
});

const zYearMonth = z
	.string()
	.nullish()
	.refine((v) => {
		if (!v) {
			return true;
		}
		const splits = v.split('-');
		return splits.length === 2 && splits[0].length === 4 && splits[1].length === 2;
	})
	.transform((v) => {
		if (v) {
			const splits = v.split('-');
			return [Number(splits[0]), Number(splits[1])];
		}
		const dateNumber = new DateNumber(DateNumberGenerator.fromToday().date);
		return [dateNumber.getYear(), dateNumber.getMonth()];
	})
	.catch(() => {
		const dateNumber = new DateNumber(DateNumberGenerator.fromToday().date);
		return [dateNumber.getYear(), dateNumber.getMonth()];
	});

export const yearMonthSchema = z.object({ date: zYearMonth });

export const releaseFiltersCalendarSchema = z.object({
	rl: z.array(z.enum(languagesArray)).catch([]),
	rf: z.array(z.enum(releaseFormatArray)).catch([]),
	sort: z.enum(releaseSortArray).catch('Relevance desc'),
	p: z.array(z.number().max(maxNumberValue)).catch([]),
	pl: z.enum(logicalOps).catch('and'),
	onlyFirst: z.boolean().default(false),
	inUpcoming: z.boolean().default(false),
	l: z.array(z.enum(userListReleaseStatus)).max(15),
	list: zUserList,
	date: zYearMonth,
});
export const releaseFiltersObjCalendarSchema = z.object({
	...releaseFiltersCalendarSchema.shape,
	date: z.array(z.number()),
	p: zPublishers,
});

export const readingLogSchema = z.object({
	date: zYearMonth,
});

export const searchNameSchema = z.object({ name: z.string().max(maxTextLength).trim() });
export const searchTagNameSchema = z.object({
	name: z.string().max(maxTextLength).trim(),
	all: z.boolean().nullish(),
});
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
export const bookListSchema = z.object({
	booklist: z.boolean().default(false),
});
export const seriesListSchema = z.object({
	serieslist: z.boolean().default(false),
});
export const listFiltersSchema = z.object({
	filters: z.string().min(1).max(maxTextLength),
});

export type Nullish<T> = T | null | undefined;
