<script lang="ts">
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import { page } from '$app/state';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Keyed from '../Keyed.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let filterInUse = $derived(Boolean(page.url.search.replace(/\?page=\d+/, '')));
</script>

<Keyed>
	<section>
		<Collapsible open={false}>
			{#snippet summary()}
				<h2 class="text-lg font-bold">
					Filters{#if filterInUse}<Icon name="filterCheck" />{:else}<Icon name="filter" />{/if}
				</h2>
			{/snippet}
			{#snippet details()}
				{@render children?.()}
			{/snippet}
		</Collapsible>
	</section>
</Keyed>
