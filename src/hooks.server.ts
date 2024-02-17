import type { Theme } from '$lib/stores/themeStore';
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/lucia';

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
				...sessionCookie.attributes
			});
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
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

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('<html lang="en">', `<html lang="en" class="${theme}">`);
		}
	});
};
