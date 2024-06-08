<script lang="ts">
	import SeriesForm from '$lib/components/form/series/SeriesForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: series = data.series;
</script>

<PageTitle title="Add series" />

<main class="container-rndb">
	<SeriesForm {series} seriesForm={data.form} type="add" user={data.user} actionUrl="/series/add" />
</main>
