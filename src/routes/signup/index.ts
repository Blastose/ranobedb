import { supabaseClient } from '$lib/db';

export const POST = async ({ request }: { request: Request }) => {
	const MIN_PASSWORD_LENGTH = 6;

	const data = await request.formData();
	const username = data.get('username') as string;
	const email = data.get('email') as string;
	const password = data.get('password') as string;
	const headers = { location: '/signup/activate' };

	const errors: Record<string, string> = {};

	if (password.length < MIN_PASSWORD_LENGTH) {
		errors.password = 'Password must contain at least 6 characters';
		return {
			status: 422,
			body: { errors }
		};
	}

	if (
		!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
			email
		)
	) {
		errors.email = 'Email address is not valid';
	}

	const { error } = await supabaseClient.auth.signUp({ email, password }, { data: { username } });

	if (error) {
		if (error.status === 429) {
			errors.requests = 'Please wait 1 minute before trying to sign up again.';
		}
		if (error.message === `duplicate key value violates unique constraint "reader_name_unq"`) {
			errors.username = 'Username already taken';
		}
		return {
			status: error.status,
			body: {
				errors
			}
		};
	}

	return {
		status: 303,
		headers
	};
};
