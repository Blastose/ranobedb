<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import { groupBy } from '$lib/db/array';
	import { languageNames } from '$lib/db/dbConsts';
	import type { BookR } from '$lib/server/db/books/books';
	import type { Language } from '$lib/server/db/dbTypes';

	export let releases: BookR['releases'];

	$: groupedReleasesByLang = groupBy(releases, (item) => item.lang);

	// For TS, since Svelte 4 cannot have TS in markup
	function getLanguageFromString(langCode: string) {
		return languageNames[langCode as Language];
	}
</script>

<section>
	<h2 class="font-bold text-lg">Releases</h2>
	<div class="flex flex-col gap-1">
		{#each Object.entries(groupedReleasesByLang) as [key, releases]}
			<section>
				<h3 class="font-semibold">{getLanguageFromString(key)}</h3>
				{#each releases as release}
					<p>
						<a class="link" href="/release/{release.id}"
							><NameDisplay obj={release} /> - {release.format}
							- {new DateNumber(release.release_date).getDateFormatted()}</a
						>
					</p>
				{/each}
			</section>
		{/each}
	</div>
</section>
