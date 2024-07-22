import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE INDEX IF NOT EXISTS book_title_title_trgm_idx ON book_title USING GIST (title gist_trgm_ops);
CREATE INDEX IF NOT EXISTS book_title_romaji_trgm_idx ON book_title USING GIST (romaji gist_trgm_ops);

CREATE INDEX IF NOT EXISTS series_title_title_trgm_idx ON series_title USING GIST (title gist_trgm_ops);
CREATE INDEX IF NOT EXISTS series_title_romaji_trgm_idx ON series_title USING GIST (romaji gist_trgm_ops);

CREATE INDEX IF NOT EXISTS release_title_trgm_idx ON release USING GIST (title gist_trgm_ops);
CREATE INDEX IF NOT EXISTS release_romaji_trgm_idx ON release USING GIST (romaji gist_trgm_ops);
`.execute(db);
}
