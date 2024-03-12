<script lang="ts">
 	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: release = data.release;
</script>

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<Release isRevision={false} {release} user={data.user} />
</DbRouteShell>
