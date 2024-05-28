<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: release = data.release;
	$: title = getNameDisplay({ obj: release, prefs: $displayPrefs.names });

	function buildBaseLink() {
		return `/release/${data.releaseId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		<svelte:fragment slot="revision">
			<Revision changes={data.changes} {title} {buildBaseLink} diffs={data.diffs} />
		</svelte:fragment>

		<svelte:fragment slot="content">
			<Release isRevision={true} {release} user={data.user} />
		</svelte:fragment>
	</RevisionContainer>
</div>
