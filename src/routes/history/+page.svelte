<script lang="ts">
	import HistoryFilters from '$lib/components/form/history/HistoryFilters.svelte';
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();

	let changes = $derived(data.changes);
	let title = 'Recent changes';
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<HistoryPaged
		{changes}
		{title}
		titleSize="big"
		currentPage={data.currentPage}
		totalPages={data.totalPages}
		showItemTitle={true}
	>
		<HistoryFilters filtersForm={data.form} />
	</HistoryPaged>
</main>
