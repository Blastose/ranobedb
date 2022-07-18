import { supabaseClient } from '$lib/db';

export const POST = async ({ request }: { request: Request }) => {
	const data = await request.formData();

	const email = data.get('email') as string;
	const password = data.get('password') as string;

	const headers = { location: '/' };

	const { session, error } = await supabaseClient.auth.signIn({ email, password });

	if (error) {
		return {
			status: 400,
			body: {
				error
			}
		};
	}

	if (session) {
		const response = await fetch('http://localhost:5173/api/auth/callback', {
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
				return cookie;
			});
		headers['Set-Cookie'] = cookies;
	}

	return {
		status: 303,
		headers
	};
};
