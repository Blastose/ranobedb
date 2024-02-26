import { languagesArray, staffRolesArray } from '$lib/db/dbTypes';
import { z } from 'zod';

export const defaultUserListLabelsArray = [
	'Reading',
	'Finished',
	'Plan to read',
	'Stalled',
	'Dropped'
] as const;
export type ReadingStatus = (typeof defaultUserListLabelsArray)[number];
export const defaultUserListLabelsMap = new Map<ReadingStatus, number>();
export const defaultUserListLabels = defaultUserListLabelsArray.map((v, index) => {
	defaultUserListLabelsMap.set(v, index + 1);
	return { id: index + 1, label: v };
});

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const zUsername = z
	.string({ required_error: 'Username is required' })
	.regex(
		USERNAME_REGEX,
		'Username must only contain alphanumeric characters, dash (-), and underscore (_)'
	);
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
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	password: z
		.string({ required_error: 'Password is required' })
		.max(255, { message: 'Password too long' })
});

export const signupSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	username: zUsername,
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be between 6 and 255 characters' })
		.max(255, { message: 'Password must be between 6 and 255 characters' })
});

const userListFormTypes = ['add', 'update', 'delete'] as const;
export type UserListFormType = (typeof userListFormTypes)[number];
export const userListBookSchema = z.object({
	labels: z.array(
		z.object({
			id: z.number().max(2000000),
			label: z.string().max(2000)
		})
	),
	readingStatus: z.enum(defaultUserListLabelsArray),
	score: z.number().min(1).max(10).nullish(),
	started: zISODate.or(z.literal('')).nullish(),
	finished: zISODate.or(z.literal('')).nullish(),
	notes: z.string().max(2000, { message: 'Note must between less than 2000 characters' }).nullish(),
	type: z.enum(userListFormTypes)
});

export const bookSchema = z.object({
	hidden: z.boolean(),
	locked: z.boolean(),
	description: z.string().max(2000).nullish(),
	description_ja: z.string().max(2000).nullish(),
	image_id: z.number().nullish(),

	titles: z
		.array(
			z.object({
				lang: z.enum(languagesArray),
				official: z.boolean(),
				title: z.string().min(1, { message: 'Title must be at least 1 character' }).max(2000),
				romaji: z.string().max(2000).nullish()
			})
		)
		.max(50)
		.refine((titles) => {
			if (titles.length === 0) {
				return false;
			}
			if (!titles.some((v) => v.lang === 'ja')) {
				return false;
			}
			return true;
		}),

	staff: z
		.array(
			z.object({
				name: z.string().max(2000),
				staff_id: z.number().max(2000000),
				staff_alias_id: z.number().max(2000000),
				role_type: z.enum(staffRolesArray),
				note: z.string().max(2000)
			})
		)
		.max(50),

	comment: z.string().min(1, { message: 'Summary must have at least 1 character' }).max(2000)
});

export const searchNameSchema = z.object({ name: z.string() });
export const revisionSchema = z.object({ revision: z.number() });

export type Nullish<T> = T | null | undefined;
