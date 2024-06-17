<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { groupBy, sortByLangObjEntries } from '$lib/db/array';
	import { languageNames } from '$lib/db/dbConsts';
	import type { BookR } from '$lib/server/db/books/books';
	import type { Language } from '$lib/server/db/dbTypes';

	export let publishers: BookR['publishers'];
	export let olang: Language;

	$: groupedPublishersByLang = groupBy(publishers, (item) => item.lang);

	// For TS, since Svelte 4 cannot have TS in markup
	function getLanguageFromString(langCode: string) {
		return languageNames[langCode as Language];
	}
</script>

<section>
	<h2 class="font-bold text-lg">Publishers</h2>

	<div class="flex flex-wrap gap-x-4 gap-y-1">
		{#each sortByLangObjEntries(Object.entries(groupedPublishersByLang), olang) as [key, publishers]}
			<section>
				<h3 class="font-semibold">{getLanguageFromString(key)}</h3>
				<p>
					{#each publishers as publisher, index}
						<span>
							<a class="link" href="/publisher/{publisher.id}"><NameDisplay obj={publisher} /></a>
							<span class="text-xs">{publisher.publisher_type}</span
							>{#if index !== publishers.length - 1}<span>,</span>{/if}
						</span>
					{/each}
				</p>
			</section>
		{/each}
	</div>
</section>
