import { z } from 'zod';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const zUsername = z
	.string({ required_error: 'Username is required' })
	.regex(
		USERNAME_REGEX,
		'Username must only contain alphanumeric characters, dash (-), and underscore (_)'
	);

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
