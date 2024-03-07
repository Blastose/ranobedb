<script lang="ts">
	import History from '$lib/components/history/History.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: publisher = data.publisher;

	$: title = `Edit history of ${publisher.name}`;

	// TODO these can be replaced with DbItem enums
	function buildRevisionLink(item_id: number, revision: number) {
		return `/publisher/${item_id}/revision/${revision}`;
	}
</script>

<PageTitle {title} />

<main class="container-rndb">
	<History {changes} {title} {buildRevisionLink} prefix="p" />
</main>
