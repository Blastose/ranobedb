import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { createRedirectUrl } from '$lib/util/createRedirectUrl';
import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import marked from '$lib/marked/marked';
import DOMPurify from 'isomorphic-dompurify';
import pkg from 'pg';
const { DatabaseError } = pkg;
import { editBookSchema, type Message } from '$lib/zod/schemas2';
import { superValidate, message, setError } from 'sveltekit-superforms/server';

export const load = (async ({ locals, url, params }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(303, createRedirectUrl('login', url));
	}

	const id = Number(params.id);
	const book = await db
		.selectFrom('book')
		.selectAll('book')
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('person')
					.innerJoin('person_book', 'person_book.person_id', 'person.id')
					.select(['person.id', 'person.name', 'person_book.role'])
					.select('person_book.role')
					.whereRef('person_book.book_id', '=', 'book.id')
			).as('people')
		])
		.where('id', '=', id)
		.groupBy('book.id')
		.executeTakeFirst();

	if (!book) {
		throw error(404);
	}

	const form = await superValidate<typeof editBookSchema, Message>(
		{
			title: book.title,
			titleRomaji: book.title_romaji ?? undefined,
			description: book.description ?? undefined,
			volume: book.volume ?? undefined,
			persons: book.people
		},
		editBookSchema
	);

	return { book, form };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params, locals }) => {
		const session = await locals.auth.validate();
		if (!session) {
			return fail(401);
		}
		const user = session.user;
		if (user.role !== 'admin') {
			return fail(401);
		}

		const id = Number(params.id);

		const form = await superValidate<typeof editBookSchema, Message>(request, editBookSchema);

		if (!form.valid) {
			return message(form, { status: 'error', text: '' }, { status: 400 });
		}

		const title = form.data.title;
		const titleRomaji = form.data.titleRomaji;
		const descriptionMarkdown = form.data.description || null;
		const volume = form.data.volume;
		const description = DOMPurify.sanitize(marked.parse(descriptionMarkdown ?? ''));
		const persons = form.data.persons;

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('book')
					.set({
						title: title,
						title_romaji: titleRomaji || null,
						description: description || null,
						description_markdown: descriptionMarkdown,
						volume: volume
					})
					.where('id', '=', id)
					.executeTakeFirstOrThrow();

				await trx.deleteFrom('person_book').where('book_id', '=', id).execute();
				const personRelInsert = persons.map((item) => {
					return { book_id: id, person_id: item.id, role: item.role };
				});
				if (personRelInsert.length > 0) {
					await trx.insertInto('person_book').values(personRelInsert).execute();
				}
			});
		} catch (e) {
			if (e instanceof DatabaseError) {
				console.log(e);
				if (e.code === '23505' && e.table === 'person_book') {
					return setError(
						form,
						'persons._errors',
						'Duplicate people with same roles in form. Remove duplicates and try again.'
					);
				}
			}
			return message(
				form,
				{ status: 'error', text: 'Invalid form entries. Unable to edit!' },
				{ status: 400 }
			);
		}
		return { success: true };
	}
} satisfies Actions;
