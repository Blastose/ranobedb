import { publisherSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import pkg from 'pg';
import { hasAddPerms } from '$lib/db/permissions';
import { addPublisher } from '$lib/server/db/publishers/actions.js';
const { DatabaseError } = pkg;

export const load = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	if (!hasAddPerms(locals.user)) {
		error(403);
	}

	const form = await superValidate({}, zod(publisherSchema), { errors: false });

	return { form };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(publisherSchema));
		if (!hasAddPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		let newPublisherId: number | undefined = undefined;
		try {
			newPublisherId = await addPublisher({ publisher: form.data }, locals.user);
		} catch (e) {
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'publisher_relation' &&
					e.constraint === 'publisher_relation_pkey'
				) {
					return setError(
						form,
						'child_publishers._errors',
						'Duplicate publishers in form. Remove duplicates and try again'
					);
				}
			}
		}

		if (newPublisherId) {
			flashRedirect(
				303,
				`/publisher/${newPublisherId}`,
				{ type: 'success', message: 'Successfully added publisher!' },
				cookies
			);
		}
		return fail(400, { form });
	}
};
