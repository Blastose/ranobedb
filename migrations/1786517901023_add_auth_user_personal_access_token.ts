import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('auth_user_personal_access_token')
		.addColumn('regenerated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
		.addColumn('user_id', 'text', (col) =>
			col.references('auth_user.id').onDelete('cascade').notNull().primaryKey(),
		)
		.addColumn('personal_access_token', 'text', (col) => col.notNull().unique())
		.execute();
}
