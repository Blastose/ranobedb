import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { PersonRoles } from '$lib/types/dbTypes';

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
					role: z.enum(PersonRoles)
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

export const joinErrors = (errors: string[] | undefined) => {
	if (errors) return errors.join('. ');
	return undefined;
};
