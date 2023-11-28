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
const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;
export const zISODate = z.string().regex(ISO_DATE_REGEX, 'Date must be a valid ISO date');

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
			id: z.number(),
			label: z.string()
		})
	),
	readingStatus: z.enum(defaultUserListLabelsArray),
	score: z.number().min(1).max(10).nullish(),
	started: zISODate.or(z.literal('')).nullish(),
	finished: zISODate.or(z.literal('')).nullish(),
	notes: z.string().max(2000, { message: 'Note must between less than 2000 characters' }).nullish(),
	type: z.enum(userListFormTypes)
});

export type Nullish<T> = T | null | undefined;
