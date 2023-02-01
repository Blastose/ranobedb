import { z } from 'zod';
import { zfd } from 'zod-form-data';
import {
	PersonRolesArray,
	PublisherRelTypeArray,
	BookFormatArray,
	ReadingListLabelArray
} from '$lib/types/dbTypes';

const ISODateRegex = /\d{4}-[01]\d-[0-3]\d/;

export const ISODate = z.string().regex(ISODateRegex, 'Date must be a valid ISO date');

export const loginSchema = zfd.formData({
	email: zfd.text(
		z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' })
	),
	password: zfd.text(
		z.string({ required_error: 'Password is required' }).max(255, { message: 'Password too long' })
	)
});

export const signupSchema = zfd.formData({
	email: zfd.text(
		z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' })
	),
	username: zfd.text(z.string({ required_error: 'Username is required' })),
	password: zfd.text(
		z
			.string({ required_error: 'Password is required' })
			.min(6, { message: 'Password must be between 6 and 255 characters' })
			.max(255, { message: 'Password must be between 6 and 255 characters' })
	)
});

export const editBookSchema = zfd.formData({
	title: zfd.text(z.string({ required_error: 'Title is required' })),
	titleRomaji: zfd.text(z.string({ required_error: 'Title romaji is required' })),
	description: z.string(),
	volume: zfd.text(z.string({ required_error: 'Volume is required' })),
	person: zfd.repeatable(
		z.array(
			zfd.json(
				z.object({
					id: z.number(),
					name: z.string(),
					role: z.enum(PersonRolesArray)
				})
			)
		)
	)
});

export const editPersonSchema = zfd.formData({
	name: zfd.text(z.string({ required_error: 'Name is required' })),
	nameRomaji: z.string(),
	description: z.string().max(1000, { message: 'Description must be less than 1000 characters' })
});

export const editPublisherSchema = zfd.formData({
	name: zfd.text(z.string({ required_error: 'Name is required' })),
	nameRomaji: z.string(),
	description: z.string().max(1000, { message: 'Description must be less than 1000 characters' }),
	publisherRel: zfd.repeatable(
		z.array(
			zfd.json(
				z.object({
					id: z.number(),
					name: z.string(),
					type: z.enum(PublisherRelTypeArray)
				})
			)
		)
	)
});

export const editSeriesSchema = zfd.formData({
	title: zfd.text(z.string({ required_error: 'Title is required' })),
	titleRomaji: z.string({ required_error: 'Title romaji is required' }),
	booksInSeries: zfd.repeatable(
		z.array(
			zfd.json(
				z.object({
					id: z.number(),
					name: z.string()
				})
			)
		)
	)
});

export const editReleaseSchema = zfd.formData({
	name: zfd.text(z.string({ required_error: 'Name is required' })),
	nameRomaji: z.string(),
	format: z.enum(BookFormatArray),
	lang: z.enum(['jp', 'en']),
	description: z.string().max(1000, { message: 'Description must be less than 1000 characters' }),
	isbn13: z
		.string()
		.min(13, { message: 'ISBN must be 13 characters or omitted' })
		.max(13, { message: 'ISBN must be 13 characters or omitted' })
		.optional()
		.or(z.literal('')),
	releaseDate: ISODate,
	publisherRel: zfd.repeatable(
		z.array(
			zfd.json(
				z.object({
					id: z.number(),
					name: z.string()
				})
			)
		)
	),
	bookRel: zfd.repeatable(
		z.array(
			zfd.json(
				z.object({
					id: z.number(),
					name: z.string()
				})
			)
		)
	)
});

export const userBookSchema = zfd.formData({
	startDate: ISODate.optional().or(z.literal('')),
	finishDate: ISODate.optional().or(z.literal('')),
	label: z.enum(ReadingListLabelArray),
	type: z.enum(['add', 'remove', 'update'])
});

export const joinErrors = (errors: string[] | undefined) => {
	if (errors) return errors.join('. ');
	return undefined;
};
