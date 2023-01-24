<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.person.person_name} - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div>
			<p class="font-bold text-2xl">{data.person.person_name}</p>
			{#if data.person.person_name_romaji}
				<p>{data.person.person_name_romaji}</p>
			{/if}
			<a class="underline" href="/person/{$page.params.id}/edit">Edit</a>
		</div>
		<div>
			<p class="font-bold">Biography</p>
			<div class="markdown-text">
				{@html data.person.person_description ?? 'N/A'}
			</div>
		</div>
		<BookView books={data.books} />
	</div>
</main>
