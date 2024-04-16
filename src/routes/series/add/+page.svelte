<script lang="ts">
	import SeriesForm from '$lib/components/form/series/SeriesForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Adding series" />

<main class="container-rndb">
	<SeriesForm series={undefined} seriesForm={data.form} type="add" user={data.user} />
</main>
