import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}
};
