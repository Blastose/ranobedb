<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';

	export let data;

	$: series = data.series;
	$: diff = data.diff;
	$: title = series.title ?? '';

	function buildBaseLink() {
		return `/series/${data.seriesId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div class="container-rndb flex flex-col gap-6">
	<Revision
		diffs={data.diffs}
		changes={data.changes}
		{title}
		{buildBaseLink}
		diff={JSON.stringify(diff)}
	/>
	<Hr />
	<Series {series} user={data.user} isRevision={true} />
</div>
