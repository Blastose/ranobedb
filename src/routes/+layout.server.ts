import { handleServerSession } from '@lucia-auth/sveltekit';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = handleServerSession(async (event: LayoutServerLoadEvent) => {
	return {
		pathname: event.url.pathname
	};
});
