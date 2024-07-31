<script lang="ts">
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import { page } from '$app/stores';
</script>

<section>
	<Collapsible open={Boolean($page.url.search.replace(/\?page=\d+/, ''))}>
		<svelte:fragment slot="summary">
			<h2 class="text-lg font-bold">Filters</h2>
		</svelte:fragment>
		<svelte:fragment slot="details">
			<slot />
		</svelte:fragment>
	</Collapsible>
</section>
