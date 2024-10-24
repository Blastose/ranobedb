import { type Kysely } from 'kysely';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
	const sessions = await db.selectFrom('auth_session').selectAll().execute();

	for (const session of sessions) {
		const newSessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(session.id)));
		await db
			.updateTable('auth_session')
			.set({
				id: newSessionId,
			})
			.where('id', '=', session.id)
			.execute();
	}
}
