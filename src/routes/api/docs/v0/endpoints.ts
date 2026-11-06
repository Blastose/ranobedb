import { anchors } from '$lib/components/api-docs/anchors';
import type {
	EndpointGroup,
	ErrorExample,
	Param,
	StatusRow,
	TocEntry,
	TocGroup,
} from '$lib/components/api-docs/types';
import type { ResponseKey } from './response-types';

const logicLink = `See <a href="#${anchors.filterLogic}">Logic params</a>.`;

const pageParam: Param = {
	name: 'page',
	type: 'number',
	required: false,
	description: 'Page number, starting at 1.',
	default: '1',
};

const limitParam: Param = {
	name: 'limit',
	type: 'number',
	required: false,
	description: 'Maximum <code>100</code>.',
	default: '24',
};

const logicParams = {
	rl: {
		name: 'rl',
		type: 'Language[]',
		required: false,
		description: 'Release languages to include.',
	},
	rll: {
		name: 'rll',
		type: "'and' | 'or'",
		required: false,
		description: `Release languages logic. ${logicLink}`,
		default: "'or'",
	},
	rf: {
		name: 'rf',
		type: "('digital' | 'print' | 'audio')[]",
		required: false,
		description: 'Release formats to include.',
	},
	rfl: {
		name: 'rfl',
		type: "'and' | 'or'",
		required: false,
		description: `Release formats logic. ${logicLink}`,
		default: "'or'",
	},
	staff: {
		name: 'staff',
		type: 'number[]',
		required: false,
		description: 'Staff IDs.',
	},
	sl: {
		name: 'sl',
		type: "'and' | 'or'",
		required: false,
		description: `Staff logic. ${logicLink}`,
		default: "'and'",
	},
	p: {
		name: 'p',
		type: 'number[]',
		required: false,
		description: 'Publisher IDs.',
	},
	pl: {
		name: 'pl',
		type: "'and' | 'or'",
		required: false,
		description: `Publisher logic. ${logicLink}`,
		default: "'or'",
	},
} satisfies Record<string, Param>;

const nameSort: Param = {
	name: 'sort',
	type: "'Name asc' | 'Name desc'",
	required: false,
	default: "'Name asc'",
};

const userBodyParams: Param[] = [
	{
		name: 'readingStatus',
		type: 'ReadingStatus',
		required: true,
	},
	{
		name: 'selectedCustLabels',
		type: 'number[]',
		required: true,
		description: 'The IDs of your custom labels.',
	},
];

const langsAndFormats: Param[] = [
	{
		name: 'langs',
		type: 'Language[]',
		required: true,
		description: 'Languages to track for upcoming books.',
	},
	{
		name: 'formats',
		type: 'Format[]',
		required: true,
		description: 'Formats to track for upcoming books.',
	},
];

const notifyBook: Param = {
	name: 'notify_book',
	type: 'boolean',
	required: false,
	default: 'true',
};

const notifyWhenReleased: Param = {
	name: 'notify_when_released',
	type: 'boolean',
	required: false,
	default: 'false',
};

const showUpcoming: Param = {
	name: 'show_upcoming',
	type: 'boolean',
	required: false,
	default: 'true',
};

const userScoreParams: Param[] = [
	{
		name: 'score',
		type: 'Score | null',
		required: false,
	},
	{
		name: 'started',
		type: 'Date | null',
		required: false,
	},
	{
		name: 'finished',
		type: 'Date | null',
		required: false,
	},
	{
		name: 'notes',
		type: 'string | null',
		required: false,
		description: 'Maximum 2000 characters.',
	},
];

/** Database and user endpoint documentation. Adding an endpoint is one entry here. */
const rawGroups: EndpointGroup<ResponseKey>[] = [
	{
		section: 'database',
		id: 'db-books',
		title: 'Books',
		curl: 'curl "https://ranobedb.org/api/v0/books?q=seishun&limit=24"',
		endpoints: [
			{
				id: 'db-books-get-list',
				method: 'GET',
				path: '/books',
				summary: 'Returns a paginated list of books.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
					limitParam,
					logicParams.rl,
					logicParams.rll,
					logicParams.rf,
					logicParams.rfl,
					logicParams.staff,
					logicParams.sl,
					logicParams.p,
					logicParams.pl,
					{
						name: 'sort',
						type: "'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Release date asc' | 'Release date desc'",
						required: false,
						default: "'Relevance desc'",
					},
				],
				responseKey: 'booksResponse',
			},
			{
				id: 'db-books-get-one',
				method: 'GET',
				path: '/book/[id]',
				summary: 'Returns one book with its titles, editions, releases, publishers and series.',
				auth: false,
				responseKey: 'bookResponse',
			},
		],
	},
	{
		section: 'database',
		id: 'db-series',
		title: 'Series',
		curl: 'curl "https://ranobedb.org/api/v0/series?q=monogatari"',
		endpoints: [
			{
				id: 'db-series-get-list',
				method: 'GET',
				path: '/series',
				summary: 'Returns a paginated list of series.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
					limitParam,
					{
						name: 'pubStatus',
						type: "('ongoing' | 'completed' | 'hiatus' | 'stalled' | 'cancelled' | 'unknown')[]",
						required: false,
					},
					{
						name: 'genresInclude',
						type: 'number[]',
						required: false,
					},
					{
						name: 'genresExclude',
						type: 'number[]',
						required: false,
					},
					{
						name: 'tagsInclude',
						type: 'number[]',
						required: false,
					},
					{
						name: 'tagsExclude',
						type: 'number[]',
						required: false,
					},
					{
						name: 'til',
						type: "'and' | 'or'",
						required: false,
						description: `Tags-include logic. ${logicLink}`,
						default: "'and'",
					},
					{
						name: 'tel',
						type: "'and' | 'or'",
						required: false,
						description: `Tags-exclude logic. ${logicLink}`,
						default: "'or'",
					},
					logicParams.rl,
					logicParams.rll,
					logicParams.rf,
					logicParams.rfl,
					logicParams.staff,
					logicParams.sl,
					logicParams.p,
					logicParams.pl,
					{
						name: 'sort',
						type: "'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Start date asc' | 'Start date desc' | 'End date asc' | 'End date desc' | 'Num. books asc' | 'Num. books desc'",
						required: false,
						default: "'Relevance desc'",
					},
				],
				responseKey: 'seriesResponse',
			},
			{
				id: 'db-series-get-one',
				method: 'GET',
				path: '/series/[id]',
				summary: 'Returns one series with its books, titles, staff, publishers and tags.',
				auth: false,
				responseKey: 'seriesOneResponse',
			},
		],
	},
	{
		section: 'database',
		id: 'db-releases',
		title: 'Releases',
		curl: 'curl "https://ranobedb.org/api/v0/releases?limit=10"',
		endpoints: [
			{
				id: 'db-releases-get-list',
				method: 'GET',
				path: '/releases',
				summary: 'Returns a paginated list of releases.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
					limitParam,
					logicParams.rl,
					logicParams.rll,
					logicParams.rf,
					logicParams.rfl,
					logicParams.p,
					{
						name: 'pl',
						type: "'and' | 'or'",
						required: false,
						description: `Publisher logic. ${logicLink}`,
						default: "'and'",
					},
					{
						name: 'minDate',
						type: 'ISO date',
						required: false,
						description: 'E.g. <code>2025-01-01</code>.',
					},
					{
						name: 'maxDate',
						type: 'ISO date',
						required: false,
						description: 'E.g. <code>2025-01-01</code>.',
					},
					{
						name: 'sort',
						type: "'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Release date asc' | 'Release date desc' | 'Pages asc' | 'Pages desc'",
						required: false,
						default: "'Relevance desc'",
					},
				],
				responseKey: 'releasesResponse',
			},
			{
				id: 'db-releases-get-one',
				method: 'GET',
				path: '/release/[id]',
				summary: 'Returns one release with its publishers and books.',
				auth: false,
				responseKey: 'releaseResponse',
			},
		],
	},
	{
		section: 'database',
		id: 'db-staff',
		title: 'Staff',
		curl: 'curl "https://ranobedb.org/api/v0/staff?q=author"',
		endpoints: [
			{
				id: 'db-staff-get-list',
				method: 'GET',
				path: '/staff',
				summary: 'Returns a paginated list of staff members.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
					limitParam,
					{
						name: 'lang',
						type: 'Language[]',
						required: false,
						description: 'Staff languages to include.',
					},
					nameSort,
				],
				responseKey: 'staffResponse',
			},
			{
				id: 'db-staff-get-one',
				method: 'GET',
				path: '/staff/[id]',
				summary: 'Returns one staff member with their aliases.',
				auth: false,
				responseKey: 'staffOneResponse',
			},
		],
	},
	{
		section: 'database',
		id: 'db-publishers',
		title: 'Publishers',
		curl: 'curl "https://ranobedb.org/api/v0/publishers?lang=en"',
		endpoints: [
			{
				id: 'db-publishers-get-list',
				method: 'GET',
				path: '/publishers',
				summary: 'Returns a paginated list of publishers.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
					limitParam,
					{
						name: 'lang',
						type: 'Language[]',
						required: false,
						description: 'Publisher languages to include.',
					},
					nameSort,
				],
				responseKey: 'publishersResponse',
			},
			{
				id: 'db-publishers-get-one',
				method: 'GET',
				path: '/publisher/[id]',
				summary: 'Returns one publisher with its child publishers.',
				auth: false,
				responseKey: 'publisherResponse',
			},
		],
	},
	{
		section: 'database',
		id: 'db-tags',
		title: 'Tags',
		curl: 'curl "https://ranobedb.org/api/v0/tags"',
		endpoints: [
			{
				id: 'db-tags-get-list',
				method: 'GET',
				path: '/tags',
				summary: 'Returns a paginated list of tags, 24 per page.',
				auth: false,
				params: [
					{
						name: 'q',
						type: 'string',
						required: false,
						description: 'Search query.',
					},
					pageParam,
				],
				responseKey: 'tagsResponse',
			},
		],
	},
	{
		section: 'user',
		id: 'user-me',
		title: 'Me',
		endpoints: [
			{
				id: 'user-me-get',
				method: 'GET',
				path: '/user/me',
				summary: 'Returns the authenticated user.',
				auth: true,
				responseKey: 'userMeResponse',
				illustrative: true,
			},
		],
	},
	{
		section: 'user',
		id: 'user-books',
		title: 'Books',
		endpoints: [
			{
				id: 'user-books-put',
				method: 'PUT',
				path: '/user/book/[id]',
				summary: 'Adds the book to your list, or edits it if it is already in your list.',
				auth: true,
				body: [...userBodyParams, ...userScoreParams],
				standardResponse: true,
			},
			{
				id: 'user-books-delete',
				method: 'DELETE',
				path: '/user/book/[id]',
				summary: 'Removes the book from your list.',
				auth: true,
				standardResponse: true,
			},
		],
	},
	{
		section: 'user',
		id: 'user-series',
		title: 'Series',
		endpoints: [
			{
				id: 'user-series-put',
				method: 'PUT',
				path: '/user/series/[id]',
				summary: 'Adds the series to your list, or edits it if it is already in your list.',
				auth: true,
				body: [
					...userBodyParams,
					...langsAndFormats,
					notifyBook,
					notifyWhenReleased,
					showUpcoming,
					{
						name: 'volumes_read',
						type: 'number | null',
						required: false,
					},
					...userScoreParams,
				],
				standardResponse: true,
			},
			{
				id: 'user-series-delete',
				method: 'DELETE',
				path: '/user/series/[id]',
				summary: 'Removes the series from your list.',
				auth: true,
				standardResponse: true,
			},
		],
	},
	{
		section: 'user',
		id: 'user-releases',
		title: 'Releases',
		endpoints: [
			{
				id: 'user-releases-put',
				method: 'PUT',
				path: '/user/release/[id]',
				summary: 'Adds the release to your list, or edits it if it is already in your list.',
				auth: true,
				body: [
					{
						name: 'release_status',
						type: "'owned' | 'deleted' | 'on loan' | 'pending' | 'unknown' | 'notify'",
						required: true,
					},
				],
				standardResponse: true,
			},
			{
				id: 'user-releases-delete',
				method: 'DELETE',
				path: '/user/release/[id]',
				summary: 'Removes the release from your list.',
				auth: true,
				standardResponse: true,
			},
		],
	},
	{
		section: 'user',
		id: 'user-staff',
		title: 'Staff',
		endpoints: [
			{
				id: 'user-staff-put',
				method: 'PUT',
				path: '/user/staff/[id]',
				summary: 'Adds the staff member to your list, or edits it if it is already in your list.',
				auth: true,
				body: [
					...langsAndFormats,
					notifyBook,
					showUpcoming,
					{
						name: 'only_first_book',
						type: 'boolean',
						required: false,
						default: 'true',
					},
				],
				standardResponse: true,
			},
			{
				id: 'user-staff-delete',
				method: 'DELETE',
				path: '/user/staff/[id]',
				summary: 'Removes the staff member from your list.',
				auth: true,
				standardResponse: true,
			},
		],
	},
	{
		section: 'user',
		id: 'user-publishers',
		title: 'Publishers',
		endpoints: [
			{
				id: 'user-publishers-put',
				method: 'PUT',
				path: '/user/publisher/[id]',
				summary:
					'Adds the publisher to your favorites. This does nothing if it is already a favorite.',
				auth: true,
				bodyNote: 'This endpoint takes no request body.',
				standardResponse: true,
			},
			{
				id: 'user-publishers-delete',
				method: 'DELETE',
				path: '/user/publisher/[id]',
				summary: 'Removes the publisher from your favorites.',
				auth: true,
				standardResponse: true,
			},
		],
	},
];

/**
 * Every `[id]` in a path is a numeric id. The book, series and release routes do not use the
 * `integer` route matcher (src/routes/api/v0/{book,series,release}/[id]), so they never reject
 * a value; every other route does and answers 404 when the segment is not digits.
 */
const unvalidatedIdRoutes = new Set(['book', 'series', 'release']);

const pathParamsFor = (path: string, section: EndpointGroup['section']): Param[] | undefined => {
	const match = /^\/(?:user\/)?(\w+)\/\[id\]$/.exec(path);
	if (!match) return undefined;
	const entity = match[1];
	const subject = entity === 'staff' ? 'staff member' : entity;
	const validation =
		section === 'database' && unvalidatedIdRoutes.has(entity)
			? ' Send an integer. A non-numeric id (<code>abc</code>) or a fractional one (<code>1.5</code>) is not validated and returns <code>500</code>, not <code>400</code> or <code>404</code>.'
			: ' Must be an integer. Anything else is rejected before the handler runs and returns the HTML <code>404</code> page, not JSON.';
	return [
		{
			name: 'id',
			type: 'number',
			required: true,
			description: `The numeric ${subject} id.${validation}`,
		},
	];
};

export const endpointGroups: EndpointGroup<ResponseKey>[] = rawGroups.map((group) => ({
	...group,
	endpoints: group.endpoints.map((endpoint) => ({
		...endpoint,
		pathParams: pathParamsFor(endpoint.path, group.section),
	})),
}));

export const databaseGroups = endpointGroups.filter((group) => group.section === 'database');
export const userGroups = endpointGroups.filter((group) => group.section === 'user');

/** Shared type definitions shown before the endpoint groups of each section. */
export const commonTypes: Record<'database' | 'user', Param[]> = {
	database: [
		{
			name: 'Language',
			type: "'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'fr' | 'es' | 'ko' | 'ar' | 'bg' | 'ca' | 'cs' | 'ck' | 'da' | 'de' | 'el' | 'eo' | 'eu' | 'fa' | 'fi' | 'ga' | 'gd' | 'he' | 'hi' | 'hr' | 'hu' | 'id' | 'it' | 'iu' | 'mk' | 'ms' | 'la' | 'lt' | 'lv' | 'nl' | 'no' | 'pl' | 'pt-pt' | 'pt-br' | 'ro' | 'ru' | 'sk' | 'sl' | 'sr' | 'sv' | 'ta' | 'th' | 'tr' | 'uk' | 'ur' | 'vi'",
		},
	],
	user: [
		{
			name: 'ReadingStatus',
			type: "'Reading' | 'Finished' | 'Plan to read' | 'Stalled' | 'Dropped' | 'Other'",
		},
		{
			name: 'Format',
			type: "'digital' | 'print' | 'audio'",
		},
		{
			name: 'Score',
			type: 'number',
			description: '1 to 10, in steps of 0.1.',
		},
		{
			name: 'Date',
			type: "ISO date or ''",
			description: 'E.g. <code>2025-01-01</code>.',
		},
		{
			name: 'UserRole',
			type: "'admin' | 'banned' | 'editor' | 'adder' | 'moderator' | 'user'",
			description: 'The <code>role</code> returned by <code>GET /user/me</code>.',
		},
		{
			name: 'LanguagePriority',
			type: "{ lang: Language; romaji: boolean; official: 'official' | 'any' }",
			description: 'One entry of <code>title_prefs</code>.',
		},
		{
			name: 'DisplayPrefs',
			type: "{ title_prefs: LanguagePriority[]; names: 'romaji' | 'native'; descriptions: 'en' | 'ja'; label_badge_display: boolean; show_nsfw: boolean }",
			description:
				'The <code>display_prefs</code> returned by <code>GET /user/me</code>. <code>title_prefs</code> holds 1 to 10 entries.',
		},
		{
			name: 'BehaviorSettings',
			type: '{ reading_dates: { auto_fill_finished_date: boolean; auto_fill_started_date: boolean; clear_dates_plan_to_read: boolean; clear_dates_stalled_dropped_other: boolean } }',
			description: 'The <code>behavior_settings</code> returned by <code>GET /user/me</code>.',
		},
	],
};

/** First request shown in Usage. Its response is the `booksResponse` example. */
export const quickstartCurl = 'curl "https://ranobedb.org/api/v0/books?limit=2"';

/** Example request for the authenticated endpoints, shown once at the top of the section. */
export const userExampleCurl =
	'curl -X PUT "https://ranobedb.org/api/v0/user/book/1" \\\n  -H "Authorization: Bearer <token>" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"readingStatus":"Reading","selectedCustLabels":[]}\'';

/** Captured from the running app: a malformed Authorization header and a missing token. */
export const errorExamples: ErrorExample[] = [
	{
		status: 400,
		reason: 'Bad Request',
		note: 'Malformed Authorization header.',
		body: '{"message":"Invalid authorization header format"}',
	},
	{
		status: 401,
		reason: 'Unauthorized',
		note: 'Missing or invalid bearer token.',
		body: '{"message":"unauthorized"}',
	},
];

/**
 * The detail routes call `error(404)` without a message for a missing or hidden entry
 * (the +server.ts files under src/routes/api/v0). SvelteKit renders that as this JSON body.
 */
export const dbErrorExamples: ErrorExample[] = [
	{
		status: 404,
		reason: 'Not Found',
		note: 'No entry with that id, or the entry is hidden.',
		body: '{"message":"Error: 404"}',
	},
	{
		status: 500,
		reason: 'Internal Server Error',
		note: 'For example a non-numeric id such as abc on /book/[id], /series/[id] or /release/[id].',
		body: '{"message":"Internal Error"}',
	},
];

/** Status codes of the database endpoints. `meaning` is limited inline HTML, as in `Param`. */
export const dbStatusCodes: StatusRow[] = [
	{ status: 200, meaning: 'Success.' },
	{
		status: 404,
		meaning:
			'No entry with that id (including <code>0</code> and negative numbers), or the entry is hidden. The body is JSON. On <code>/staff/[id]</code> and <code>/publisher/[id]</code> an id that is not an integer also returns <code>404</code>, but as the HTML error page.',
	},
	{
		status: 500,
		meaning:
			'Unexpected server error. <code>/book/[id]</code>, <code>/series/[id]</code> and <code>/release/[id]</code> also return this for an id that is not an integer, such as <code>abc</code> or <code>1.5</code>.',
	},
];

/** Status codes of the `/user` endpoints. */
export const userStatusCodes: StatusRow[] = [
	{ status: 200, meaning: 'Success.' },
	{
		status: 400,
		meaning:
			'Invalid JSON body or invalid fields; or the entity / list entry does not exist. Note that missing resources are reported as <code>400</code>, not <code>404</code>.',
	},
	{ status: 401, meaning: 'Missing or invalid bearer token.' },
];

/** Where each shared type is defined, for linking from parameter types. */
export const typeLinks: Record<string, string> = Object.fromEntries([
	...commonTypes.database.map((type) => [type.name, `#${anchors.dbCommonTypes}`]),
	...commonTypes.user.map((type) => [type.name, `#${anchors.userCommonTypes}`]),
]);

const toEntries = (groups: EndpointGroup[]): TocEntry[] =>
	groups.flatMap((group) => [
		{ id: group.id, label: group.title },
		...group.endpoints.map((endpoint) => ({
			id: endpoint.id,
			label: endpoint.path,
			method: endpoint.method,
			indent: true,
		})),
	]);

/** Table of contents generated from the endpoint data so entries cannot drift from anchors. */
export const docToc: TocGroup[] = [
	{
		label: 'Overview',
		entries: [
			{ id: anchors.introduction, label: 'Introduction' },
			{ id: anchors.usage, label: 'Usage' },
			{ id: anchors.filterLogic, label: 'Logic params' },
			{ id: anchors.authentication, label: 'Authentication' },
			{ id: anchors.rateLimits, label: 'Rate limits' },
			{ id: anchors.standardResponses, label: 'Standard responses' },
		],
	},
	{
		label: 'Database querying',
		id: anchors.databaseQuerying,
		entries: [
			{ id: anchors.dbCommonTypes, label: 'Common types' },
			{ id: anchors.dbFieldNotes, label: 'Field notes' },
			{ id: anchors.dbStatusCodes, label: 'Status codes' },
			...toEntries(databaseGroups),
		],
	},
	{
		label: 'User',
		id: anchors.user,
		entries: [
			{ id: anchors.userStatusCodes, label: 'Status codes' },
			{ id: anchors.userCommonTypes, label: 'Common types' },
			...toEntries(userGroups),
		],
	},
];
