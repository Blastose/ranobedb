<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import type { PageData } from './$types';

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
		</div>
		<div>
			<p class="font-bold">Biography</p>
			<p>{data.person.person_description ?? 'N/A'}</p>
		</div>
		<BookView books={data.books} />
	</div>
</main>
