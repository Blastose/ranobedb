<script lang="ts">
	import SeriesForm from '$lib/components/form/series/SeriesForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();
</script>

<PageTitle title="Add series" />
<NoIndex />

<main class="container-rndb">
	<SeriesForm
		series={undefined}
		seriesForm={data.form}
		type="add"
		user={data.user}
		actionUrl="/series/add"
	/>
</main>
