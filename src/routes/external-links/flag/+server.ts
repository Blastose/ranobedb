import type { RequestHandler } from './$types';

const CODE_RE = /^[a-z0-9-]{2,16}$/;

export const GET: RequestHandler = async ({ url, fetch }) => {
	const code = url.searchParams.get('code');
	if (!code || !CODE_RE.test(code)) {
		return new Response('Invalid code', { status: 400 });
	}

	const flagUrl = `https://flagcdn.com/${code}.svg`;
	const res = await fetch(flagUrl);

	if (!res.ok) {
		return new Response('Invalid code', { status: 400 });
	}

	const blob = await res.blob();

	return new Response(blob, {
		headers: {
			'Content-Type': res.headers.get('Content-Type') || 'image/svg+xml',
			'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
		},
	});
};
