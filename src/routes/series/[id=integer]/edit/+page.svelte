<script lang="ts">
	import SeriesForm from '$lib/components/form/series/SeriesForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: series = data.series;
</script>

<PageTitle title="Editing {series.title ?? ''}" />

<main class="container-rndb">
	<SeriesForm {series} seriesForm={data.form} type="edit" user={data.user} />
</main>
