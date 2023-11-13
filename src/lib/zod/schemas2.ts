import { PersonRolesArray, ReadingListLabelArray } from '$lib/types/dbTypes';
import { z } from 'zod';

const ISODateRegex = /\d{4}-[01]\d-[0-3]\d/;

export const ISODate = z.string().regex(ISODateRegex, 'Date must be a valid ISO date');

export type Message = { status: 'error' | 'success' | 'warning'; text: string };

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
	username: z.string({ required_error: 'Username is required' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be between 6 and 255 characters' })
		.max(255, { message: 'Password must be between 6 and 255 characters' })
});

export const userBookSchema = z.object({
	startDate: ISODate.or(z.literal('')).optional(),
	finishDate: ISODate.or(z.literal('')).optional(),
	label: z.enum(ReadingListLabelArray),
	type: z.enum(['add', 'remove', 'update']),
	inList: z.boolean().optional()
});

export const editBookSchema = z.object({
	title: z.string({ required_error: 'Title is required' }),
	titleRomaji: z.string({ required_error: 'Title romaji is required' }),
	description: z.string().optional(),
	volume: z.string({ required_error: 'Volume is required' }),
	persons: z
		.object({
			id: z.number(),
			name: z.string(),
			role: z.enum(PersonRolesArray)
		})
		.array()
});
