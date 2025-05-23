<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let series = $derived(data.series);
	let title = $derived(getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs }));
	let firstBookInSeries = $derived(series.books.at(0));
	let imageUrl = $derived(buildImageUrl(firstBookInSeries?.image?.filename));

	function buildBaseLink() {
		return `/series/${data.seriesId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} image={imageUrl} description={series.description} site_name={'RanobeDB'} />
<NoIndex />

<main class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		{#snippet revision()}
			<Revision
				diffs={data.diffs}
				changes={data.changes}
				{title}
				{buildBaseLink}
				currentItemVisibility={data.currentItemVisibility}
			/>
		{/snippet}

		{#snippet content()}
			<Series
				series={{ ...series, id: data.seriesId }}
				user={data.user}
				revision={data.revision.revision}
			/>
		{/snippet}
	</RevisionContainer>
</main>
