import type { DB, UserListLabel } from '$lib/server/db/dbTypes';
import { defaultUserListLabels } from '$lib/db/dbConsts';
import type { Insertable, Kysely, Transaction } from 'kysely';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import { deletedUser } from './ranobebot';
import type { User } from '$lib/server/lucia/lucia';
import { hashPassword } from '$lib/server/password/hash';

export async function insertDefaultUserListLabels(trx: Transaction<DB>, userId: string) {
	const defaultUserListLabelValues = defaultUserListLabels.map((v, i) => {
		return {
			...v,
			private: false,
			user_id: userId,
			sort_order: i - 11,
		};
	}) satisfies Insertable<UserListLabel>[];
	await trx
		.insertInto('user_list_label')
		.values(defaultUserListLabelValues)
		.onConflict((oc) => oc.columns(['user_id', 'id']).doNothing())
		.execute();
}

export class DBUsers {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async createUser(user: { email: string; password: string; username: string; id: string }) {
		const hashed_password = await hashPassword(user.password);

		return await this.db.transaction().execute(async (trx) => {
			const createdUser = await trx
				.insertInto('auth_user')
				.values({
					username: user.username,
					username_lowercase: user.username.toLowerCase(),
					id: user.id,
				})
				.returningAll()
				.executeTakeFirstOrThrow();
			await trx
				.insertInto('auth_user_credentials')
				.values({
					email: user.email.toLowerCase(),
					hashed_password: hashed_password,
					user_id: user.id,
				})
				.execute();

			await insertDefaultUserListLabels(trx, user.id);

			await trx.insertInto('user_list_settings').values({ user_id: user.id }).execute();

			return createdUser;
		});
	}

	async getEmail(userId: string) {
		return await this.db
			.selectFrom('auth_user_credentials')
			.select(['email', 'email_verified'])
			.where('auth_user_credentials.user_id', '=', userId)
			.executeTakeFirstOrThrow();
	}

	async getUserByEmail(email: string) {
		return await this.db
			.selectFrom('auth_user')
			.innerJoin('auth_user_credentials', 'auth_user.id', 'auth_user_credentials.user_id')
			.where('auth_user_credentials.email', '=', email.toLowerCase())
			.selectAll()
			.executeTakeFirst();
	}

	async getUserByUsername(username: string) {
		return await this.db
			.selectFrom('auth_user')
			.innerJoin('auth_user_credentials', 'auth_user.id', 'auth_user_credentials.user_id')
			.where('auth_user.username_lowercase', '=', username.toLowerCase())
			.selectAll()
			.executeTakeFirst();
	}

	async getUserFull(usernameemail: string) {
		if (usernameemail.includes('@')) {
			return await this.getUserByEmail(usernameemail);
		} else {
			return await this.getUserByUsername(usernameemail);
		}
	}

	async getUserByIdNumbericSafe(id_numeric: number) {
		return await this.db
			.selectFrom('auth_user')
			.where('auth_user.id_numeric', '=', id_numeric)
			.select([
				'auth_user.id_numeric',
				'auth_user.username',
				'auth_user.joined',
				'auth_user.id',
				'auth_user.role',
			])
			.executeTakeFirst();
	}

	transformUserToSafeUser(user: User & { joined: Date }): SafeUser {
		return {
			id: user.id,
			id_numeric: user.id_numeric,
			joined: user.joined,
			username: user.username,
			role: user.role,
		};
	}

	async changeUsername(params: { userId: string; newUsername: string }) {
		await this.db
			.updateTable('auth_user')
			.set({
				username: params.newUsername,
				username_lowercase: params.newUsername.toLowerCase(),
			})
			.where('auth_user.id', '=', params.userId)
			.execute();
	}

	async changePassword(params: { userId: string; newPassword: string }) {
		const hashed_password = await hashPassword(params.newPassword);

		await this.db.transaction().execute(async (trx) => {
			await trx
				.updateTable('auth_user_credentials')
				.set({
					hashed_password,
				})
				.where('auth_user_credentials.user_id', '=', params.userId)
				.execute();
		});
	}

	async updateDisplayPrefs(params: { userId: string; displayPrefs: DisplayPrefs }) {
		await this.db
			.updateTable('auth_user')
			.set({
				display_prefs: JSON.stringify(params.displayPrefs),
			})
			.where('auth_user.id', '=', params.userId)
			.execute();
	}

	async getListPrefs(userId: string, trx?: Transaction<DB>) {
		if (trx) {
			return await trx
				.selectFrom('user_list_settings')
				.select(['default_series_settings', 'default_book_settings', 'default_release_settings'])
				.where('user_id', '=', userId)
				.executeTakeFirstOrThrow();
		}

		return await this.db
			.selectFrom('user_list_settings')
			.select(['default_series_settings', 'default_book_settings', 'default_release_settings'])
			.where('user_id', '=', userId)
			.executeTakeFirstOrThrow();
	}

	async deleteUser(params: { userId: string }) {
		await this.db.transaction().execute(async (trx) => {
			await trx.deleteFrom('user_list_settings').where('user_id', '=', params.userId).execute();
			await trx.deleteFrom('user_list_book_label').where('user_id', '=', params.userId).execute();
			await trx.deleteFrom('user_list_book').where('user_id', '=', params.userId).execute();
			await trx.deleteFrom('user_list_label').where('user_id', '=', params.userId).execute();
			await trx
				.deleteFrom('email_verification_code')
				.where('user_id', '=', params.userId)
				.execute();
			await trx.deleteFrom('auth_session').where('user_id', '=', params.userId).execute();
			await trx
				.updateTable('change')
				.set({ user_id: deletedUser.id })
				.where('user_id', '=', params.userId)
				.execute();
			await trx.deleteFrom('auth_user_credentials').where('user_id', '=', params.userId).execute();
			await trx.deleteFrom('auth_user').where('id', '=', params.userId).execute();
		});
	}
}

export type SafeUser = NonNullable<Awaited<ReturnType<DBUsers['getUserByIdNumbericSafe']>>>;
