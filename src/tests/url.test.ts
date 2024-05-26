import { buildRedirectUrl, buildUrlFromRedirect } from '$lib/utils/url';
import { describe, it, expect } from 'vitest';

describe('url', () => {
	it('builds the redirect url', () => {
		const redirectUrl = buildRedirectUrl(new URL('http://localhost:5173/book/2/edit'), '/login');
		expect(redirectUrl).toBe('/login?redirect=/book/2/edit');
	});
	it('builds the url from redirect param', () => {
		const nextUrl = buildUrlFromRedirect(new URL('http://localhost:5173/login'), 'book/2/edit');
		expect(nextUrl).toBe('http://localhost:5173/book/2/edit');
		const nextUrl2 = buildUrlFromRedirect(
			new URL('http://localhost:5173/login'),
			'http://malicious.example.com',
		);
		expect(nextUrl2).toBe('http://localhost:5173/http://malicious.example.com');
		const nextUrl3 = buildUrlFromRedirect(
			new URL('http://localhost:5173/login'),
			'/malicious.example.com',
		);
		expect(nextUrl3).toBe('http://localhost:5173/malicious.example.com');
	});
});
