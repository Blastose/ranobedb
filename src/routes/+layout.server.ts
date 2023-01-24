import { handleServerSession } from '@lucia-auth/sveltekit';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load = handleServerSession(async (event: LayoutServerLoadEvent) => {
	return {
		pathname: event.url.pathname
	};
}) satisfies LayoutServerLoad;
