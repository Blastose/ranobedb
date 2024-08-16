<script lang="ts">
	import type { Language } from '$lib/server/db/dbTypes';
	import Collapsible from '../display/Collapsible.svelte';
	import LangChip from './LangChip.svelte';

	export let titles: {
		lang: Language;
		romaji: string | null;
		official: true;
		title: string;
	}[];
</script>

<section>
	<Collapsible open={false}>
		<svelte:fragment slot="summary"><h2 class="font-bold text-lg">Titles</h2></svelte:fragment>
		<svelte:fragment slot="details">
			{#each titles as title}
				<div class="grid grid-cols-[24px_1fr] gap-2">
					<LangChip lang={title.lang} />

					<div>
						<p>{title.title}</p>
						{#if title.romaji}
							<p>{title.romaji}</p>
						{/if}
					</div>
				</div>
			{/each}</svelte:fragment
		>
	</Collapsible>
</section>
