import type { DB, UserListLabel } from '$lib/server/db/dbTypes';
import { defaultUserListLabels } from '$lib/db/dbConsts';
import type { Insertable, Kysely, Transaction } from 'kysely';
import { Argon2id } from 'oslo/password';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import { deletedUser } from './ranobebot';

export async function insertDefaultUserListLabels(trx: Transaction<DB>, userId: string) {
	const defaultUserListLabelValues = defaultUserListLabels.map((v) => {
		return {
			...v,
			private: false,
			user_id: userId,
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
		const hashed_password = await new Argon2id().hash(user.password);

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

			return createdUser;
		});
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

	async getUser(usernameemail: string) {
		if (usernameemail.includes('@')) {
			return await this.getUserByEmail(usernameemail);
		} else {
			return await this.getUserByUsername(usernameemail);
		}
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
		const hashed_password = await new Argon2id().hash(params.newPassword);

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

	async deleteUser(params: { userId: string }) {
		await this.db.transaction().execute(async (trx) => {
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
