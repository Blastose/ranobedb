import { type Kysely } from 'kysely';
import type { DB } from '$lib/server/db/dbTypes';
import { sendRecentlyReleasedNotifications } from './daily';

export class Notifications {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async getNotifications(userId: string) {
		return await this.db
			.selectFrom('notification')
			.where('notification.user_id', '=', userId)
			.select([
				'notification.message',
				'notification.is_read',
				'notification.notification_type',
				'notification.sent',
				'notification_type',
				'notification.hidden',
				'notification.url',
				'notification.image_filename',
				'notification.notification_type',
			])
			.orderBy('notification.sent desc')
			.limit(10)
			.execute();
	}
}

export type Notification = Awaited<ReturnType<Notifications['getNotifications']>>[number];

await sendRecentlyReleasedNotifications();
