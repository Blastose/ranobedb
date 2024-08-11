<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: release = data.release;
	$: title = getNameDisplay({ obj: release, prefs: $displayPrefs.names });
	$: firstBookInReleases = release.books.at(0);
	$: imageUrl = buildImageUrl(firstBookInReleases?.image?.filename);

	function buildBaseLink() {
		return `/release/${data.releaseId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} image={imageUrl} description={release.description} site_name={'RanobeDB'} />
<NoIndex />

<main class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		<svelte:fragment slot="revision">
			<Revision
				changes={data.changes}
				{title}
				{buildBaseLink}
				diffs={data.diffs}
				currentItemVisibility={data.currentItemVisibility}
			/>
		</svelte:fragment>

		<svelte:fragment slot="content">
			<Release
				revision={data.revision.revision}
				release={{ ...release, id: data.releaseId }}
				user={data.user}
			/>
		</svelte:fragment>
	</RevisionContainer>
</main>
