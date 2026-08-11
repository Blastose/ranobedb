<script lang="ts">
	import { page } from '$app/state';
	import PrivateProfile from '$lib/components/forbidden/PrivateProfile.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let error = $derived(page.error);
	let status = $derived(page.status);
</script>

<!-- This should always display since its an +error.svelte page, but we need the if check for TypeScript -->
{#if error}
	<PageTitle title={error.profilePrivate ? 'Private Profile' : error.message} />

	{#if error.profilePrivate && status === 403}
		<PrivateProfile user={error.profilePrivate.user} hasChanges={error.profilePrivate.hasChanges} />
	{:else}
		<main class="container-rndb">
			<h1 class="font-bold text-lg">{status} {error.message}</h1>
		</main>
	{/if}
{/if}
