<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { groupBy, sortByLangObjEntries } from '$lib/db/array';
	import { languageNames } from '$lib/db/dbConsts';
	import type { BookOne } from '$lib/server/db/books/books';
	import type { Language } from '$lib/server/db/dbTypes';
	import Collapsible from '../display/Collapsible.svelte';

	export let publishers: BookOne['publishers'];
	export let olang: Language;
	export let onlyOpenOlang: boolean;

	$: groupedPublishersByLang = groupBy(publishers, (item) => item.lang);

	// For TS, since Svelte 4 cannot have TS in markup
	function getLanguageFromString(langCode: string) {
		return languageNames[langCode as Language];
	}
</script>

<section>
	<h2 class="font-bold text-lg">Publishers</h2>

	<div class="flex flex-col gap-x-4 gap-y-1">
		{#each sortByLangObjEntries(Object.entries(groupedPublishersByLang), olang) as [key, publishers]}
			<section>
				<Collapsible open={onlyOpenOlang ? key === olang : key === 'ja' || key === 'en'}>
					<svelte:fragment slot="summary">
						<h3 class="font-semibold">{getLanguageFromString(key)}</h3>
					</svelte:fragment>
					<svelte:fragment slot="details">
						<p>
							{#each publishers as publisher, index}
								<span>
									<a class="link" href="/publisher/{publisher.id}"
										><NameDisplay obj={publisher} /></a
									>
									<span class="text-xs">{publisher.publisher_type}</span
									>{#if index !== publishers.length - 1}<span>,</span>{/if}
								</span>
							{/each}
						</p>
					</svelte:fragment>
				</Collapsible>
			</section>
		{:else}
			<p>This item doesn't have any publishers associated with it yet.</p>
		{/each}
	</div>
</section>
