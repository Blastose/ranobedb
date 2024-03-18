<script lang="ts">
	import History from '$lib/components/history/History.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: series = data.series;

	$: title = `Edit history of ${series.title ?? ''}`;

	function buildRevisionLink(item_id: number, revision: number) {
		return `/series/${item_id}/revision/${revision}`;
	}
</script>

<PageTitle {title} />

<main class="container-rndb">
	<History {changes} {title} {buildRevisionLink} prefix="s" />
</main>
