<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: staff = data.staff;
	$: title = getNameDisplay({ obj: staff, prefs: $displayPrefs.names });

	function buildBaseLink() {
		return `/staff/${data.staffId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} description={staff.description} site_name={'RanobeDB'} />
<NoIndex />

<div class="container-rndb flex flex-col gap-6">
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
			<Staff
				staff={{ ...staff, id: data.staffId }}
				works={data.works}
				user={data.user}
				revision={data.revision.revision}
				results={data.count}
				currentPage={data.currentPage}
				totalPages={data.totalPages}
			/>
		</svelte:fragment>
	</RevisionContainer>
</div>
