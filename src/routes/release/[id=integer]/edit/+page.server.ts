import { releaseSchema, revisionSchema } from '$lib/zod/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasEditPerms, hasVisibilityPerms } from '$lib/db/permissions';
import { ChangePermissionError, HasRelationsError } from '$lib/server/db/errors/errors.js';
import { getCurrentVisibilityStatus } from '$lib/server/db/dbHelpers';
import { revertedRevisionMarkdown } from '$lib/db/revision.js';
import { getReleaseEdit, getReleaseHistEdit } from '$lib/server/db/releases/releases.js';
import { editRelease } from '$lib/server/db/releases/actions.js';

export const load = async ({ params, locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const id = params.id;
	const releaseId = Number(id);
	let release;

	const revision = await superValidate(url, zod(revisionSchema));
	// We need to check if the url search params contains `revision`
	// because the .valid property will be false if it doesn't,
	// but that's find since we'll just use the "current" revision
	if (revision.valid && url.searchParams.get('revision')) {
		release = await getReleaseHistEdit({
			id: releaseId,
			revision: revision.data.revision
		}).executeTakeFirst();
	} else {
		release = await getReleaseEdit(releaseId).executeTakeFirst();
	}

	if (!release) {
		error(404);
	}

	const visibilityStatus = getCurrentVisibilityStatus(release);

	if (visibilityStatus.locked || visibilityStatus.hidden) {
		if (!hasVisibilityPerms(locals.user)) {
			error(403);
		}
	}
	if (!hasEditPerms(locals.user)) {
		error(403);
	}

	const prefilledComment =
		revision.valid && url.searchParams.get('revision')
			? revertedRevisionMarkdown('r', 'release', releaseId, revision.data.revision)
			: undefined;

	const form = await superValidate({ ...release, comment: prefilledComment }, zod(releaseSchema), {
		errors: false
	});

	return { release, form };
};

export const actions = {
	default: async ({ request, locals, params, cookies }) => {
		const id = Number(params.id);
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod(releaseSchema));
		if (!hasEditPerms(locals.user)) {
			return fail(403, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		let success = false;
		try {
			await editRelease({ release: form.data, id }, locals.user);
			success = true;
		} catch (e) {
			console.log(e);
			if (e instanceof DatabaseError) {
				if (
					e.code === '23505' &&
					e.table === 'release_book' &&
					e.constraint === 'release_book_pkey'
				) {
					return setError(
						form,
						'books._errors',
						'Duplicate books in form. Remove duplicates and try again'
					);
				} else if (
					e.code === '23505' &&
					e.table === 'release_publisher' &&
					e.constraint === 'release_publisher_pkey'
				) {
					return setError(
						form,
						'publishers._errors',
						'Duplicate publishers in form. Remove duplicates and try again'
					);
				}
			} else if (e instanceof ChangePermissionError) {
				return fail(403, { form });
			} else if (e instanceof HasRelationsError) {
				return setError(
					form,
					'hidden',
					'Cannot hide publisher. Remove any relations to the publisher and try again.'
				);
			}
		}

		if (success) {
			flashRedirect(
				303,
				`/publisher/${id}`,
				{ type: 'success', message: 'Successfully edited publisher!' },
				cookies
			);
		}
		return fail(400, { form });
	}
};
