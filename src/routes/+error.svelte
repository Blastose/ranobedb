<script lang="ts">
	import { page } from '$app/stores';
	import AccessDenied from '$lib/components/forbidden/AccessDenied.svelte';
	import DeletedItem from '$lib/components/forbidden/DeletedItem.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	$: error = $page.error;
	$: status = $page.status;

	$: console.log(error);
	$: console.log(status);
</script>

{#if error}
	<PageTitle title={error.message} />

	<main class="container-rndb">
		{#if error.dbItemDeleted && status === 403}
			<DeletedItem
				title={error.dbItemDeleted.title ?? ''}
				reason={error.dbItemDeleted.reason ?? ''}
			/>
		{:else if status === 403}
			<AccessDenied />
		{:else}
			<h1 class="font-bold text-lg">{status} {error.message}</h1>
		{/if}
	</main>
{/if}
