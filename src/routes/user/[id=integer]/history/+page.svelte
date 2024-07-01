<script lang="ts">
	import HistoryFilters from '$lib/components/form/history/HistoryFilters.svelte';
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: title = `Edit history of ${data.routeUser.username}`;
</script>

<PageTitle {title} />

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
