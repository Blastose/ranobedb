import { db } from '$lib/server/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const load = async () => {
	const books = await db
		.selectFrom('book')
		.leftJoin('image', 'book.image_id', 'image.id')
		.selectAll('book')
		.select(['image.filename'])
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom('book_title')
					.whereRef('book_title.book_id', '=', 'book.id')
					.select(['book_title.title', 'book_title.lang', 'book_title.official'])
			).as('titles'),
			jsonArrayFrom(
				eb
					.selectFrom('person_alias')
					.innerJoin('book_person_alias', 'book_person_alias.person_alias_id', 'person_alias.id')
					.whereRef('book_person_alias.book_id', '=', 'book.id')
					.select(['book_person_alias.role_type', 'person_alias.name', 'person_alias.person_id'])
			).as('persons')
		])
		.execute();

	return {
		books
	};
};
