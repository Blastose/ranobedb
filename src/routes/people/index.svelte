<script lang="ts">
	import type Person from '$lib/models/person';
	export let people: Person[];
</script>

<svelte:head>
	<title>People - RanobeDB</title>
</svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<span class="font-bold text-2xl dark:text-white">People</span>
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			{#each people as person (person.person_id)}
				<div>
					<a href="/person/{person.person_id}" sveltekit:prefetch>
						<span class="dark:text-white">{person.person_name}</span>
					</a>
				</div>
			{/each}
		</div>
	</div>
</main>
