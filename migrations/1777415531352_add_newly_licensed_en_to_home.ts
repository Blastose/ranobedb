import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
CREATE TABLE public.kv_store (
    key TEXT NOT NULL PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auth_user
ALTER COLUMN home_display_settings SET DEFAULT '{"header": true, "popular_series": true, "reviews": true, "upcoming_releases": true, "recently_released": true, "seasonal_anime": true, "annoucements": true, "recent_changes": true, "newly_licensed_en": true}'::jsonb;

UPDATE public.auth_user
SET home_display_settings['newly_licensed_en'] = to_jsonb(true);
`.execute(db);
}
