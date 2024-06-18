import type { Kysely } from 'kysely';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { generateRandomString, alphabet } from 'oslo/crypto';
import type { DB } from '../db/dbTypes';
import { type User } from 'lucia';
import { EmailBuilder, EmailSender } from './sender';
import { getMode } from '$lib/mode/mode';
import { generateId } from '../lucia';

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

	async sendVerificationCodeEmail(params: {
		username: string;
		email: string;
		verificationCode: string;
	}) {
		const { username, email, verificationCode } = params;
		if (getMode() !== 'production') {
			console.log(verificationCode);
		} else {
			const builtEmail = new EmailBuilder({ to: email }).createVerificationCodeEmail(
				username,
				verificationCode,
			);
			await new EmailSender().sendEmail(builtEmail);
		}
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

	async sendVerificationTokenUrlEmail(params: {
		username: string;
		email: string;
		verificationTokenUrl: string;
	}) {
		const { username, email, verificationTokenUrl } = params;
		if (getMode() !== 'production') {
			console.log(verificationTokenUrl);
		} else {
			const builtEmail = new EmailBuilder({ to: email }).createVerificationTokenEmail(
				username,
				verificationTokenUrl,
			);
			await new EmailSender().sendEmail(builtEmail);
		}
	}

	async createEmailVerificationToken(userId: string, new_email: string): Promise<string> {
		await this.db.deleteFrom('email_verification_token').where('user_id', '=', userId).execute();
		const tokenId = generateId();
		await this.db
			.insertInto('email_verification_token')
			.values({
				token_hash: tokenId,
				user_id: userId,
				new_email: new_email,
				expires_at: createDate(new TimeSpan(2, 'h')),
			})
			.execute();

		return tokenId;
	}

	async updateUserEmail(userId: string, new_email: string) {
		await this.db.transaction().execute(async (trx) => {
			const user = await trx
				.selectFrom('auth_user')
				.where('auth_user.id', '=', userId)
				.selectAll()
				.executeTakeFirstOrThrow();
			await trx
				.updateTable('auth_user_credentials')
				.set({
					email: new_email,
					email_verified: true,
				})
				.where('auth_user_credentials.user_id', '=', userId)
				.execute();
			if (user.role === 'user') {
				await trx
					.updateTable('auth_user')
					.set({ role: 'editor' })
					.where('auth_user.id', '=', userId)
					.execute();
			}
		});
	}

	async setUserEmailStatusToVerified(user: User) {
		await this.db.transaction().execute(async (trx) => {
			await trx
				.updateTable('auth_user_credentials')
				.set({
					email_verified: true,
				})
				.where('auth_user_credentials.user_id', '=', user.id)
				.execute();
			if (user.role === 'user') {
				await trx
					.updateTable('auth_user')
					.set({ role: 'editor' })
					.where('auth_user.id', '=', user.id)
					.execute();
			}
		});
	}
}
