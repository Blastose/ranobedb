import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	const { user } = await event.locals.auth.validateUser();
	return {
		pathname: event.url.pathname,
		user
	};
}) satisfies LayoutServerLoad;
