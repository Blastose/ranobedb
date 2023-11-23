import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '$lib/server/db/db';
import type { InferResult } from 'kysely';

export const getPeople = db
	.selectFrom('person')
	.innerJoin('person_alias', 'person_alias.person_id', 'person.id')
	.selectAll('person')
	.selectAll('person_alias')
	.select((eb) => [
		jsonArrayFrom(
			eb
				.selectFrom('book')
				.innerJoin('book_person_alias', 'book_person_alias.book_id', 'book.id')
				.innerJoin('person_alias', (join) =>
					join
						.onRef('person_alias.id', '=', 'book_person_alias.person_alias_id')
						.onRef('person_alias.id', '=', 'person.id')
				)
				.whereRef('person_alias.id', '=', 'person.id')
				.select([
					'book.id',
					'person_alias.name',
					'person_alias.main_alias',
					'person_alias.person_id',
					'book_person_alias.role_type'
				])
				.select((eb) => [
					jsonArrayFrom(
						eb
							.selectFrom('book_title')
							.whereRef('book_title.book_id', '=', 'book.id')
							.select(['book_title.title', 'book_title.lang', 'book_title.official'])
					).as('titles')
				])
		).as('books')
	]);

export type People = InferResult<typeof getPeople>[number];
