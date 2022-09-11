<script lang="ts">
	import BookView from '$lib/book/BookView.svelte';
	import type BookInfo from '$lib/models/bookInfo';

	import type Person from '$lib/models/person';
	export let person: Person;
	export let books: BookInfo[];
</script>

<svelte:head>
	<title>{person.person_name} - RanobeDB</title>
</svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-2xl dark:text-white">{person.person_name}</span>
			{#if person.person_name_romaji}
				<span class="font-semibold dark:text-white">{person.person_name_romaji}</span>
			{/if}
		</div>
		<div class="flex flex-col gap-2">
			<BookView {books} />
		</div>
	</div>
</main>
