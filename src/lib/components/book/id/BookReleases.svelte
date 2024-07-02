<script lang="ts">
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import { getLanguageFromString, groupBy, sortByLangObjEntries } from '$lib/db/array';
 	import type { BookR } from '$lib/server/db/books/books';
	import type { Language } from '$lib/server/db/dbTypes';

	export let releases: BookR['releases'];
	export let olang: Language;

	$: groupedReleasesByLang = groupBy(releases, (item) => item.lang);
</script>

<section>
	<h2 class="font-bold text-lg">Releases</h2>
	<div class="flex flex-col gap-1">
		{#each sortByLangObjEntries(Object.entries(groupedReleasesByLang), olang) as [key, releases]}
			<section>
				<Collapsible open={key === 'ja' || key === 'en'}>
					<svelte:fragment slot="summary"
						><h3 class="font-semibold">{getLanguageFromString(key)}</h3></svelte:fragment
					>
					<svelte:fragment slot="details">
						{#each releases as release (release.id)}
							<p>
								<a class="link" href="/release/{release.id}"
									><NameDisplay obj={release} /> - {release.format}
									- {new DateNumber(release.release_date).getDateFormatted()}</a
								>
							</p>
						{/each}
					</svelte:fragment>
				</Collapsible>
			</section>
		{/each}
	</div>
</section>
