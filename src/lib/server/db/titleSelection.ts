import { expressionBuilder, type AliasableExpression, type Expression, type SqlBool } from 'kysely';
import type { DB, Language, TitlesCache } from './dbTypes';
import type { LanguagePriority } from '$lib/server/zod/schema';

export function titleSelection<Item extends 'book' | 'series'>(
	item: Item,
	preferences: readonly LanguagePriority[],
) {
	const eb = expressionBuilder<DB & { item: { titles: TitlesCache } }, 'item'>();

	const getCachedTitle = (language: Language) => ({
		entry: eb.ref('item.titles', '->').key(language),
		title: eb.ref('item.titles', '->>').key(language).key('title'),
		romaji: eb.ref('item.titles', '->>').key(language).key('romaji'),
		official: eb.cast<boolean>(
			eb.ref('item.titles', '->>').key(language).key('official'),
			'boolean',
		),
	});

	const candidates = preferences.map((preference) => {
		const preferred = getCachedTitle(preference.lang);
		const conditions: Expression<SqlBool>[] = [eb(preferred.entry, 'is not', null)];

		if (preference.official === 'official') {
			conditions.push(preferred.official);
		}
		if (preference.romaji) {
			conditions.push(eb(preferred.romaji, 'is not', null));
		}

		return {
			...preferred,
			language: preference.lang,
			matchesPreference: eb.and(conditions),
		};
	});

	const selectPreferred = <T>(
		valueFor: (candidate: (typeof candidates)[number]) => Expression<T>,
		fallback: AliasableExpression<T>,
	): AliasableExpression<T> => {
		const [first, ...remaining] = candidates;
		if (!first) return fallback;

		let selection = eb.case().when(first.matchesPreference).then(valueFor(first));

		for (const candidate of remaining) {
			selection = selection.when(candidate.matchesPreference).then(valueFor(candidate));
		}

		return selection.else(fallback).end();
	};

	const original = getCachedTitle('ja');

	const selectedLanguage = selectPreferred(
		(candidate) => eb.val(candidate.language),
		eb.val<Language>('ja'),
	);
	const selectedTitle = selectPreferred(
		(candidate) => candidate.title.$notNull(),
		original.title.$notNull(),
	);
	const selectedRomaji = selectPreferred((candidate) => candidate.romaji, original.romaji);

	const sortKeys = candidates.map((candidate) =>
		eb
			.case()
			.when(candidate.matchesPreference)
			.then(eb.fn.coalesce(candidate.romaji, candidate.title))
			.end(),
	);
	const sortKey = eb.fn<string>('coalesce', [...sortKeys, original.romaji, original.title]);

	return eb
		.selectFrom([`${item} as item`])
		.selectAll()
		.select([
			selectedLanguage.as('lang'),
			selectedTitle.as('title'),
			selectedRomaji.as('romaji'),
			original.title.as('title_orig'),
			original.romaji.as('romaji_orig'),
			sortKey.as('sort_key'),
		])
		.where(eb(eb.ref('item.titles').$castTo<unknown>(), '?', 'ja')); // Ensure Japanese title exists for fallback
}
