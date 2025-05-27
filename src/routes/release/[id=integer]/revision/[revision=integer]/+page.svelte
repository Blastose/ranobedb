<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let release = $derived(data.release);
	let title = $derived(getNameDisplay({ obj: release, prefs: $displayPrefs.names }));
	let firstBookInReleases = $derived(release.books.at(0));
	let imageUrl = $derived(buildImageUrl(firstBookInReleases?.image?.filename));

	function buildBaseLink() {
		return `/release/${data.releaseId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} image={imageUrl} description={release.description} site_name={'RanobeDB'} />
<NoIndex />

<main class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		{#snippet revision()}
			<Revision
				changes={data.changes}
				{title}
				{buildBaseLink}
				diffs={data.diffs}
				currentItemVisibility={data.currentItemVisibility}
			/>
		{/snippet}

		{#snippet content()}
			<Release
				revision={data.revision.revision}
				release={{ ...release, id: data.releaseId }}
				user={data.user}
			/>
		{/snippet}
	</RevisionContainer>
</main>
