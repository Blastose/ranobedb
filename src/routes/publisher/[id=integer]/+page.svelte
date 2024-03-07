<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Publisher from '$lib/components/publisher/id/Publisher.svelte';
	import { themeStore } from '$lib/stores/themeStore';

	export let data;

	$: publisher = data.publisher;
</script>

<PageTitle title={publisher.name} />

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<Publisher {publisher} />
</DbRouteShell>
