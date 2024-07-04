import type { Theme } from '$lib/stores/themeStore';
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/lucia';
import { getMode } from '$lib/mode/mode';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}
		event.locals.user = user;
		event.locals.session = session;
	}

	const themeCookie = event.cookies.get('theme');
	let theme: Theme = 'dark';
	if (themeCookie === 'light' || themeCookie === 'dark') {
		theme = themeCookie;
	}
	event.locals.theme = theme;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('<html lang="en">', `<html lang="en" class="${theme}">`);
		},
	});

	// Limit link header since it can be too large for Nginx
	// See https://github.com/sveltejs/kit/issues/11084
	if (getMode() === 'production') {
		const linkHeader = response.headers.get('link');
		let newLinkHeader = '';
		if (linkHeader) {
			const splits = linkHeader.split(',');
			for (const split of splits) {
				if (newLinkHeader.length + split.length < 3500) {
					newLinkHeader += split;
				}
			}
		}
		if (newLinkHeader) {
			response.headers.set('link', newLinkHeader);
		} else {
			response.headers.delete('link');
		}
	}

	return response;
};
