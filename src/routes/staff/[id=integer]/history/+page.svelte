<script lang="ts">
	import History from '$lib/components/history/History.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: staff = data.staff;

	$: title = `Edit history of ${staff.name ?? ''}`;

	function buildRevisionLink(item_id: number, revision: number) {
		return `/staff/${item_id}/revision/${revision}`;
	}
</script>

<PageTitle {title} />

<main class="container-rndb">
	<History {changes} {title} {buildRevisionLink} prefix="st" />
</main>
