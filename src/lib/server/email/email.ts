import type { Kysely } from 'kysely';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { generateRandomString, alphabet } from 'oslo/crypto';
import type { DB } from '../db/dbTypes';
import type { User } from 'lucia';

export class EmailVerification {
	db: Kysely<DB>;

	constructor(db: Kysely<DB>) {
		this.db = db;
	}

	async generateEmailVerificationCode(userId: string, email: string): Promise<string> {
		await this.db.deleteFrom('email_verification_code').where('user_id', '=', userId).execute();
		const code = generateRandomString(8, alphabet('0-9'));
		await this.db
			.insertInto('email_verification_code')
			.values({
				user_id: userId,
				email,
				code,
				expires_at: createDate(new TimeSpan(15, 'm')), // 15 minutes
			})
			.execute();
		return code;
	}

	async sendVerificationCode(email: string, verificationCode: string) {
		// TODO
		email;
		verificationCode;
	}

	async verifyVerificationCode(user: User, code: string): Promise<boolean> {
		return await this.db.transaction().execute(async (trx) => {
			const databaseCode = await trx
				.selectFrom('email_verification_code')
				.where('user_id', '=', user.id)
				.selectAll()
				.executeTakeFirst();

			if (!databaseCode || databaseCode.code !== code) {
				return false;
			}
			await trx.deleteFrom('email_verification_code').where('id', '=', databaseCode.id).execute();

			if (!isWithinExpirationDate(databaseCode.expires_at)) {
				return false;
			}
			const userAuthCreds = await trx
				.selectFrom('auth_user_credentials')
				.select('email')
				.where('auth_user_credentials.user_id', '=', user.id)
				.executeTakeFirst();
			if (!userAuthCreds) {
				return false;
			}
			if (databaseCode.email !== userAuthCreds.email) {
				return false;
			}
			return true;
		});
	}

	async setUserEmailStatusToVerified(user: User) {
		await this.db.transaction().execute(async (trx) => {
			if (user.role !== 'user') {
				return;
			}

			await trx
				.updateTable('auth_user_credentials')
				.set({
					email_verified: true,
				})
				.execute();
			if (user.role === 'user') {
				await trx.updateTable('auth_user').set({ role: 'editor' }).execute();
			}
		});
	}
}
