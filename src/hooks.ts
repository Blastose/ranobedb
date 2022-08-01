import { handleAuth } from '@supabase/auth-helpers-sveltekit';
import type { GetSession, Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import dotenv from 'dotenv';
dotenv.config();

export const handle: Handle = sequence(
	...handleAuth({
		logout: { returnTo: '/login' }
	})
);

export const getSession: GetSession = async (event) => {
	const { user, accessToken, error } = event.locals;
	return {
		user,
		accessToken,
		error
	};
};
