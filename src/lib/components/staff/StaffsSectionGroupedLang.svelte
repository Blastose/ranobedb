<script lang="ts">
	import { getLanguageFromString, groupBy, sortByLangObjEntries } from '$lib/db/array';
	import type { Language } from '$lib/server/db/dbTypes';
	import type { Series } from '$lib/server/db/series/series';
	import Collapsible from '../display/Collapsible.svelte';
	import StaffsSectionSnippet from './StaffsSectionSnippet.svelte';

	interface Props {
		staffs: Series['staff'];
		olang: Language;
		onlyOlang: boolean;
	}

	let { staffs, olang, onlyOlang }: Props = $props();

	let groupedStaffsByLang = $derived(groupBy(staffs, (item) => item.lang || olang));
</script>

<section>
	<h2 class="font-bold text-lg">Staff</h2>

	<div class="flex flex-col gap-1">
		{#each sortByLangObjEntries(Object.entries(groupedStaffsByLang), olang) as [key, staffs]}
			<section>
				<!-- TODO Let users select what should auto-collapse -->
				<Collapsible open={onlyOlang ? key === olang : key === 'ja' || key === 'en'}>
					{#snippet summary()}
						<h3>{getLanguageFromString(key)}</h3>
					{/snippet}

					{#snippet details()}
						<div class="pt-2">
							<StaffsSectionSnippet {staffs} />
						</div>
					{/snippet}
				</Collapsible>
			</section>
		{/each}
	</div>
</section>
