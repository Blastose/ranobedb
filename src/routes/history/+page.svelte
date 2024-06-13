<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	let title = 'Recent changes';
</script>

<PageTitle {title} />

<main class="container-rndb">
	<HistoryPaged
		{changes}
		{title}
		currentPage={data.currentPage}
		totalPages={data.totalPages}
		showItemTitle={true}
	/>
</main>
