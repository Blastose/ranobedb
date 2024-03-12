<script lang="ts">
	import History from '$lib/components/history/History.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: release = data.release;

	$: title = `Edit history of ${release.title}`;

	// TODO these can be replaced with DbItem enums
	function buildRevisionLink(item_id: number, revision: number) {
		return `/release/${item_id}/revision/${revision}`;
	}
</script>

<PageTitle {title} />

<main class="container-rndb">
	<History {changes} {title} {buildRevisionLink} prefix="r" />
</main>
