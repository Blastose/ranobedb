import { sql } from 'kysely';
import { db } from '$lib/server/db/db';

export async function sendRecentlyReleasedNotifications() {
	console.log('Running recently released notifications job');
	await db
		.with('release_to_add', (qb) =>
			qb
				.selectFrom('release')
				.innerJoin('user_list_release', 'user_list_release.release_id', 'release.id')
				.innerJoin('auth_user', 'auth_user.id', 'user_list_release.user_id')
				.innerJoin('release_book', 'release_book.release_id', 'release.id')
				.innerJoin('book', 'book.id', 'release_book.book_id')
				.leftJoin('image', 'image.id', 'book.image_id')
				.where(
					'release.release_date',
					'=',
					sql<number>`replace(current_date::text, '-', '')::integer`,
				)
				.where('release.hidden', '=', false)
				.where('book.hidden', '=', false)
				.where('user_list_release.release_status', '=', 'notify')
				.distinctOn(['user_list_release.user_id', 'release.id'])
				.select([
					'user_list_release.user_id',
					'release.title',
					'release.romaji',
					'release.format',
					'release.id as release_id',
					'release.release_date',
					'auth_user.display_prefs',
					'image.filename',
				]),
		)
		.insertInto('notification')
		.columns([
			'hidden',
			'is_read',
			'message',
			'notification_type',
			'user_id',
			'url',
			'item_id',
			'item_name',
		])
		.expression((eb) =>
			eb
				.selectFrom('release_to_add')
				.select((eb) => [
					eb.lit(false).as('hidden'),
					eb.lit(false).as('is_read'),
					eb
						.fn('concat', [
							eb.cast(
								eb
									.case()
									.when(eb.ref('display_prefs', '->>').key('names'), '=', 'native')
									.then(eb.ref('title'))
									.when(eb.ref('display_prefs', '->>').key('names'), '=', 'romaji')
									.then(eb.fn.coalesce('romaji', 'title'))
									.end(),
								'text',
							),
							eb.cast(eb.val(' ('), 'text'),
							eb.ref('format'),
							eb.cast(eb.val(') '), 'text'),
							eb.cast(eb.val('will be released on'), 'text'),
							eb.cast(eb.val(' '), 'text'),
							eb.cast(
								eb.fn('to_char', [
									eb.fn('to_date', [
										eb.cast('release_to_add.release_date', 'text'),
										eb.val('YYYYMMDD'),
									]),
									eb.val('YYYY-MM-DD'),
								]),
								'text',
							),
							eb.cast(eb.val('.'), 'text'),
						])
						.as('message'),
					eb.val('Available soon').as('notification_type'),
					'release_to_add.user_id',
					eb
						.fn('concat', [
							eb.cast(eb.val('/release/'), 'text'),
							eb.cast('release_to_add.release_id', 'text'),
						])
						.as('url'),
					eb.ref('release_to_add.release_id').as('item_id'),
					eb.val('release').as('item_name'),
				]),
		)
		.execute();
}
