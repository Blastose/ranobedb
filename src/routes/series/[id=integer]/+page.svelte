<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;
	$: series = data.series;
</script>

<PageTitle title={series.title ?? ""}  />

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<Series isRevision={false} {series} user={data.user} />
</DbRouteShell>
