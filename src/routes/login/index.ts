import { supabaseClient } from '$lib/db';

export const POST = async ({ request, url }: { request: Request; url: URL }) => {
	const data = await request.formData();

	const email = data.get('email') as string;
	const password = data.get('password') as string;
	const remember = data.get('remember') as string;

	const redirect = url.searchParams.get('redirect');
	const headers = { location: redirect ? redirect : '/' };

	const { session, error } = await supabaseClient.auth.signIn({ email, password });

	if (error) {
		return {
			status: 400,
			body: {
				error: 'Invalid login credentials'
			}
		};
	}

	if (session) {
		const response = await fetch(`${url.origin}/api/auth/callback`, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
			body: JSON.stringify({ event: 'SIGNED_IN', session })
		});

		const cookies = response.headers
			.get('set-cookie')
			.split('SameSite=Lax, ')
			.map((cookie) => {
				if (!cookie.includes('SameSite=Lax')) {
					cookie += 'SameSite=Lax';
				}
				if (!remember) {
					// Set the cookie to session
					const regexExpires = /Expires.*?; /;
					cookie = cookie.replace(regexExpires, '');
					const regex2MaxAge = /Max-Age.*?; /;
					cookie = cookie.replace(regex2MaxAge, '');
				}
				return cookie;
			});
		headers['Set-Cookie'] = cookies;
	}

	return {
		status: 303,
		headers
	};
};
