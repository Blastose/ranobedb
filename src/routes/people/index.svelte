<script lang="ts">
	import type Person from '$lib/models/person';
	export let people: Person[];
</script>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="grid grid-cols-2 md:grid-cols-3">
		{#each people as person (person.person_id)}
			<div>
				<a href="/person/{person.person_id}" sveltekit:prefetch>
					<span>{person.person_name}</span>
				</a>
			</div>
		{/each}
	</div>
</main>
