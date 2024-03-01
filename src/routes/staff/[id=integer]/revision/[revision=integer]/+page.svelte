<script lang="ts">
	import Revision from '$lib/components/history/Revision.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';

	export let data;

	$: staff = data.staff;
	$: diff = data.diff;
	$: title = staff.name;

	function buildBaseLink() {
		return `/staff/${data.staffId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div class="container-rndb flex flex-col gap-6">
	<Revision changes={data.changes} {title} {buildBaseLink} diff={JSON.stringify(diff)} />

	<Staff {staff} />
</div>
