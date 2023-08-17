import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	const session = await event.locals.auth.validate();

	return {
		pathname: event.url.pathname,
		user: session?.user
	};
}) satisfies LayoutServerLoad;
