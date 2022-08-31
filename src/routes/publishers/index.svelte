<script lang="ts">
	import type Publisher from '$lib/models/publisher';
	export let publishers: Publisher[];
</script>

<svelte:head>
	<title>Publishers - RanobeDB</title>
</svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<span class="font-bold text-2xl">Publishers</span>
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			{#each publishers as publisher (publisher.id)}
				<div>
					<a href="/publisher/{publisher.id}" sveltekit:prefetch>
						<span>{publisher.name}</span>
					</a>
				</div>
			{/each}
		</div>
	</div>
</main>
