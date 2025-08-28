import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
ALTER TABLE public.auth_user
ADD COLUMN home_display_settings JSONB NOT NULL DEFAULT '{"header": true, "popular_series": true, "reviews": true, "upcoming_releases": true, "recently_released": true, "seasonal_anime": true, "annoucements": true, "recent_changes": true}'::jsonb;`.execute(
		db,
	);
}
