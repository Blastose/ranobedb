<script lang="ts">
	import BookCard from '$lib/book/BookCard.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import LoadingIcon from '$lib/svg/LoadingIcon.svelte';
	import type Book from '$lib/models/book';

	let books: Book[] | null = null;

	const getBooks = async () => {
		try {
			let { data, error } = await supabase
				.from<Book>('book')
				.select('*')
				.order('title_romaji', { ascending: true });
			if (error) throw error;
			books = data;
		} catch (error: any) {
			console.error(error);
		}
	};

	onMount(() => {
		getBooks();
	});
</script>

{#if books}
	<div class="flex flex-col gap-2">
		<p>{books.length} books</p>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
			{#each books as book}
				<BookCard {book} />
			{/each}
		</div>
	</div>
{:else}
	<div class="flex justify-center py-2"><LoadingIcon /></div>
{/if}
