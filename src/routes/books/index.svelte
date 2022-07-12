<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let books: any = null;

	const getBooks = async () => {
		try {
			let { data, error } = await supabase
				.from('book_info')
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
	{#each books as book}
		<p>
			<a href="/book/{book.id}" class="text-blue-600">{book.title}</a>
			| {book.publisher.join(', ')}
		</p>
	{/each}
{:else}
	<div><span>Loading</span></div>
{/if}
