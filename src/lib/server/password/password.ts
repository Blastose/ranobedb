import { db } from '../db/db';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import dayjs from 'dayjs';
import { generateEntropyId } from '../lucia/lucia';

export async function createPasswordResetToken(userId: string): Promise<string> {
	const tokenId = await db.transaction().execute(async (trx) => {
		await trx.deleteFrom('password_reset_token').where('user_id', '=', userId).execute();

		const tokenId = generateEntropyId();

		const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(tokenId)));
		const now = dayjs();

		await trx
			.insertInto('password_reset_token')
			.values({
				token_hash: tokenHash,
				user_id: userId,
				expires_at: now.add(2, 'hour').toDate(),
			})
			.execute();

		return tokenId;
	});

	return tokenId;
}
