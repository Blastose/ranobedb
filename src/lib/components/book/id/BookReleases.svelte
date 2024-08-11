<script lang="ts">
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import { getLanguageFromString, groupBy, sortByLangObjEntries } from '$lib/db/array';
	import type { BookOne } from '$lib/server/db/books/books';
	import type { Language } from '$lib/server/db/dbTypes';
	import BookRelease from './BookRelease.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { Infer } from 'sveltekit-superforms/server';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';

	export let releases: BookOne['releases'];
	export let olang: Language;
	export let userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined;

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
						<div class="flex flex-col">
							{#each releases as release, index (release.id)}
								<BookRelease {release} {userListReleaseForm} />
								{#if index !== releases.length - 1}
									<Hr />
								{/if}
							{/each}
						</div>
					</svelte:fragment>
				</Collapsible>
			</section>
		{/each}
	</div>
</section>
