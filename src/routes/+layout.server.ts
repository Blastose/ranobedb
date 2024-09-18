import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({ locals, url }) => {
	return {
		user: locals.user,
		url: url.pathname,
		theme: locals.theme,
	};
});
