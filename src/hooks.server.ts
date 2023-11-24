import { auth } from '$lib/server/lucia';
import type { Theme } from '$lib/stores/themeStore';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);
	const session = await event.locals.auth.validate();
	event.locals.user = session?.user;
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
