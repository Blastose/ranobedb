import { TimeSpan, createDate } from 'oslo';
import { sha256 } from 'oslo/crypto';
import { encodeHex } from 'oslo/encoding';
import { db } from '../db/db';
import { generateId } from '../lucia';

export async function createPasswordResetToken(userId: string): Promise<string> {
	const tokenId = await db.transaction().execute(async (trx) => {
		await trx.deleteFrom('password_reset_token').where('user_id', '=', userId).execute();

		const tokenId = generateId();

		const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));
		await trx
			.insertInto('password_reset_token')
			.values({
				token_hash: tokenHash,
				user_id: userId,
				expires_at: createDate(new TimeSpan(2, 'h')),
			})
			.execute();

		return tokenId;
	});

	return tokenId;
}
