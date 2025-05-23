<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Charts from './Charts.svelte';
	import { page } from '$app/state';

	let { data } = $props();
</script>

<PageTitle title={data.listUser.username} />
<NoIndex />

{#key page.url}
	<Charts {data} />
{/key}
