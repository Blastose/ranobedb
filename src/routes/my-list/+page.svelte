<script lang="ts">
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { PageData } from './$types';
	const user = getUser();

	export let data: PageData;
</script>

<svelte:head>
	<title>My List - RanobeDB</title>
</svelte:head>

<main class="mx-auto max-w-xl pt-4 px-4 flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<p>Username: {$user?.username}</p>
		<p>Reader ID: {$user?.readerId}</p>
		<div>
			{#each data.reads as r}
				<p>{r.title}</p>
			{/each}
		</div>
	</div>
</main>
