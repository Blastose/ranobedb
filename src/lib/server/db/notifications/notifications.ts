import { type InferResult, type Kysely } from 'kysely';
import type { DB } from '$lib/server/db/dbTypes';
import { sendRecentlyReleasedNotifications } from './daily';

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
				'notification.image_filename',
				'notification.notification_type',
				'notification.is_read',
			])
			.orderBy('notification.sent desc');
	}
}

export type Notification = InferResult<ReturnType<Notifications['getNotifications']>>[number];

await sendRecentlyReleasedNotifications();
