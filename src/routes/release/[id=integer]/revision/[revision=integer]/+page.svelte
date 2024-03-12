<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Release from '$lib/components/release/id/Release.svelte';

	export let data;

	$: release = data.release;
	$: diff = data.diff;
	$: title = release.title;

	function buildBaseLink() {
		return `/release/${data.releaseId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div>
	<div class="container-rndb">
		<Revision changes={data.changes} {title} {buildBaseLink} diff={JSON.stringify(diff)} />
	</div>

	<div class="container-rndb">
		<Release isRevision={true} {release} user={data.user} />
	</div>
</div>
