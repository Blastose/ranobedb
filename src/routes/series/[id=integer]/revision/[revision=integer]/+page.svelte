<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: series = data.series;
	$: title = getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs });

	function buildBaseLink() {
		return `/series/${data.seriesId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		<svelte:fragment slot="revision">
			<Revision diffs={data.diffs} changes={data.changes} {title} {buildBaseLink} />
		</svelte:fragment>

		<svelte:fragment slot="content">
			<Series
				series={{ ...series, id: data.seriesId }}
				user={data.user}
				revision={data.revision.revision}
			/>
		</svelte:fragment>
	</RevisionContainer>
</div>
