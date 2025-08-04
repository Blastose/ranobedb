import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`
UPDATE public.user_list_book
SET score = score * 10
WHERE score IS NOT NULL;

UPDATE public.user_list_series
SET score = score * 10
WHERE score IS NOT NULL;

UPDATE public.user_book_review
SET score = score * 10
WHERE score IS NOT NULL;

UPDATE public.user_series_review
SET score = score * 10
WHERE score IS NOT NULL;

ALTER TABLE public.user_list_book
ADD CONSTRAINT user_list_book_score_check CHECK (score IS NULL OR score BETWEEN 10 AND 100);

ALTER TABLE public.user_list_series
ADD CONSTRAINT user_list_series_score_check CHECK (score IS NULL OR score BETWEEN 10 AND 100);

ALTER TABLE public.user_book_review
ADD CONSTRAINT user_book_review_score_check CHECK (score IS NULL OR score BETWEEN 10 AND 100);

ALTER TABLE public.user_series_review
ADD CONSTRAINT user_series_review_score_check CHECK (score IS NULL OR score BETWEEN 10 AND 100);
`.execute(db);
}
