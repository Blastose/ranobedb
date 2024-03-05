<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: staff = data.staff;
</script>

<PageTitle title={staff.name} />

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<Staff {staff} user={data.user} isRevision={false} />
</DbRouteShell>
