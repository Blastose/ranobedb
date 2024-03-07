<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Publisher from '$lib/components/publisher/id/Publisher.svelte';

	export let data;

	$: publisher = data.publisher;
	$: diff = data.diff;
	$: title = publisher.name;

	function buildBaseLink() {
		return `/publisher/${data.publisherId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div>
	<div class="container-rndb">
		<Revision changes={data.changes} {title} {buildBaseLink} diff={JSON.stringify(diff)} />
	</div>

	<div class="container-rndb">
		<Publisher {publisher} />
	</div>
</div>
