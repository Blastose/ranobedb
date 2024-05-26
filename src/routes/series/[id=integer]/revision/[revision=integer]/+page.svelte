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

<div class="grid grid-cols-2">
	<div>
		<p>Old</p>
		{#if data.diffTrimmedLinesOuput}
			{#each data.diffTrimmedLinesOuput as part}
				{#if !part.added}
					{#if part.removed}
						{#each part.value.split('\n') as pa}
							<p class="w-fit bg-red-500 bg-opacity-30">{@html pa}</p>
						{/each}
					{:else}
						{#each part.value.split('\n') as pa}
							<p>{@html pa}</p>
						{/each}
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
	<div>
		<p>New</p>
		{#if data.diffTrimmedLinesOuput}
			{#each data.diffTrimmedLinesOuput as part}
				{#if !part.removed}
					{#if part.added}
						{#each part.value.split('\n') as pa}
							<p class="w-fit bg-green-500 bg-opacity-30">{@html pa}</p>
						{/each}
					{:else}
						{#each part.value.split('\n') as pa}
							<p>{@html pa}</p>
						{/each}
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
</div>
<div class="container-rndb flex flex-col gap-6">
	<Revision changes={data.changes} {title} {buildBaseLink} diff={JSON.stringify(diff)} />

	<Series {series} user={data.user} isRevision={true} />
</div>
