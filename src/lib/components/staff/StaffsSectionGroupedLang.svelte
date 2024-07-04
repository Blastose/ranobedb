<script lang="ts">
	import { getLanguageFromString, groupBy, sortByLangObjEntries } from '$lib/db/array';
	import type { Language } from '$lib/server/db/dbTypes';
	import type { Series } from '$lib/server/db/series/series';
	import Collapsible from '../display/Collapsible.svelte';
	import StaffsSectionSnippet from './StaffsSectionSnippet.svelte';

	export let staffs: Series['staff'];
	export let olang: Language;
	export let onlyOlang: boolean;

	$: groupedStaffsByLang = groupBy(staffs, (item) => item.lang || olang);
</script>

<section>
	<h2 class="font-bold text-lg">Staff</h2>

	<div class="flex flex-col gap-1">
		{#each sortByLangObjEntries(Object.entries(groupedStaffsByLang), olang) as [key, staffs]}
			<section>
				<!-- TODO Let users select what should auto-collapse -->
				<Collapsible open={onlyOlang ? key === olang : key === 'ja' || key === 'en'}>
					<svelte:fragment slot="summary">
						<h3>{getLanguageFromString(key)}</h3>
					</svelte:fragment>

					<div class="pt-2" slot="details">
						<StaffsSectionSnippet {staffs} />
					</div>
				</Collapsible>
			</section>
		{/each}
	</div>
</section>
