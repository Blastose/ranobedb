<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Publisher from '$lib/components/publisher/id/Publisher.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let publisher = $derived(data.publisher);
	let title = $derived(getNameDisplay({ obj: publisher, prefs: $displayPrefs.names }));

	function buildBaseLink() {
		return `/publisher/${data.publisherId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} description={publisher.description} site_name={'RanobeDB'} />
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
			<Publisher
				publisher={{ ...publisher, id: data.publisherId }}
				works={data.works}
				revision={data.revision.revision}
				user={data.user}
				currentPage={data.currentPage}
				results={data.count}
				totalPages={data.totalPages}
			/>
		{/snippet}
	</RevisionContainer>
</main>
