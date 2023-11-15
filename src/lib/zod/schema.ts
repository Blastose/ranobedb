import { z } from 'zod';

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
