import type { RequestHandler } from './$types';

const DOMAIN_RE = /^[a-zA-Z0-9.-]+$/;

export const GET: RequestHandler = async ({ url, fetch }) => {
	const domain = url.searchParams.get('domain');
	if (
		!domain ||
		!DOMAIN_RE.test(domain) ||
		domain.includes('..') ||
		domain.startsWith('.') ||
		domain.endsWith('.')
	) {
		return new Response('Invalid domain', { status: 400 });
	}

	const googleUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
	const res = await fetch(googleUrl);

	const blob = await res.blob();

	return new Response(blob, {
		headers: {
			'Content-Type': res.headers.get('Content-Type') || 'image/png',
			'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
		},
	});
};
