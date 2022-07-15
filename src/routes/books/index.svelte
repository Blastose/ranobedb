<script lang="ts">
	import BookCard from '$lib/book/BookCard.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let books: any = null;

	const getBooks = async () => {
		try {
			let { data, error } = await supabase
				.from('book')
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
	<div><span>Loading</span></div>
{/if}
