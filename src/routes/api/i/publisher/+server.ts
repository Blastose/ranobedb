import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { sql, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { searchNameSchema } from '$lib/server/zod/schema';
import { zod4 } from 'sveltekit-superforms/adapters';

async function getPublisherByName(name: string, nameAsNumber: number) {
	return await db
		.selectFrom('publisher')
		.select(['publisher.name', 'publisher.id', 'publisher.romaji'])
		.where(({ eb }) => {
			const ors: Expression<SqlBool>[] = [];
			eb.and([
				eb(
					eb.fn('greatest', [
						eb.fn('word_similarity', [eb.val(name), eb.ref('publisher.name')]),
						eb.fn('word_similarity', [eb.val(name), eb.ref('publisher.romaji')]),
					]),
					'>',
					0.3,
				),
				eb.or([
					eb(eb.val(name), sql.raw('<%'), eb.ref('publisher.name')).$castTo<boolean>(),
					eb(eb.val(name), sql.raw('<%'), eb.ref('publisher.romaji')).$castTo<boolean>(),
				]),
			]);

			if (!isNaN(nameAsNumber)) {
				ors.push(eb('publisher.id', '=', nameAsNumber));
			}
			return eb.or(ors);
		})
		.where('publisher.hidden', '=', false)
		.orderBy(
			(eb) =>
				eb.fn('greatest', [
					eb.fn('word_similarity', [eb.val(name), eb.ref('publisher.name')]),
					eb.fn('word_similarity', [eb.val(name), eb.ref('publisher.romaji')]),
				]),
			'desc',
		)
		.limit(16)
		.execute();
}
export type ApiPublisher = Awaited<ReturnType<typeof getPublisherByName>>;

export const GET: RequestHandler = async ({ url }) => {
	const form = await superValidate(url.searchParams, zod4(searchNameSchema));
	if (!form.valid) {
		return json([]);
	}

	const nameAsNumber = Number(form.data.name);
	let name = form.data.name;

	const s = await getPublisherByName(name, nameAsNumber);
	return json(s);
};
