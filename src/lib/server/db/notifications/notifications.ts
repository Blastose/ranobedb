import { type InferResult, type Kysely } from 'kysely';
import type { DB } from '$lib/server/db/dbTypes';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export class Notifications {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async hasNotifications(userId: string) {
		const res = await this.db
			.selectNoFrom((eb) => [
				eb
					.exists(
						eb
							.selectFrom('notification')
							.where('notification.is_read', '=', false)
							.where('notification.user_id', '=', userId),
					)
					.as('notifs'),
			])
			.limit(1)
			.execute();

		return Boolean(res.at(0)?.notifs);
	}

	getNotifications(userId: string) {
		return this.db
			.selectFrom('notification')
			.where('notification.user_id', '=', userId)
			.select((eb) => [
				'notification.message',
				'notification.notification_type',
				eb
					.cast(eb.fn('date_part', [eb.val('epoch'), 'notification.sent']), 'integer')
					.$castTo<number>()
					.as('sent'),
				'notification_type',
				'notification.url',
				'notification.notification_type',
				'notification.is_read',
			])
			.select((eb) =>
				jsonObjectFrom(
					eb
						.selectFrom('image')
						.select(['image.filename'])
						.innerJoin('release_book', 'notification.item_id', 'release_book.release_id')
						.innerJoin('book', 'book.id', 'release_book.book_id')
						.whereRef('image.id', '=', 'book.image_id')
						.where('book.hidden', '=', false)
						.limit(1),
				).as('image'),
			)
			.orderBy('notification.sent desc');
	}
}

export type Notification = InferResult<ReturnType<Notifications['getNotifications']>>[number];
