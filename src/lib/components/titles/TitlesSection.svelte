<script lang="ts">
	import type { Language } from '$lib/server/db/dbTypes';
	import Collapsible from '../display/Collapsible.svelte';

	export let titles: {
		lang: Language;
		romaji: string | null;
		official: true;
		title: string;
	}[];
</script>

<section>
	<Collapsible open={true}>
		<svelte:fragment slot="summary"><h2 class="font-bold text-lg">Titles</h2></svelte:fragment>
		<svelte:fragment slot="details">
			{#each titles as title}
				<div class="grid grid-cols-[24px_1fr] gap-2">
					<div class="pt-[3px]">
						<p class="sub-text">
							{title.lang}
						</p>
					</div>

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

<style>
	.sub-text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: fit-content;
		font-size: 0.625rem;
		line-height: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		border-radius: 0.375rem;
		border-width: 1px;
		border-color: var(--text-light-sub);
	}

	:global(.dark) .sub-text {
		border-color: var(--text-dark-sub);
	}
</style>
