<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let book: any = undefined;
	let image: any = undefined;

	const getBook = async () => {
		try {
			let { data: _book, error } = await supabase
				.from('book')
				.select('*')
				.eq('id', $page.params.id);
			if (error) throw error;
			console.log(_book);
			if (_book) {
				if (_book.length === 1) {
					book = _book[0];
				}
			}

			let { publicURL, error: error2 } = supabase.storage
				.from('cover-images')
				.getPublicUrl(`${book.cover_image_file_name}.jpg`);
			if (error2) throw error2;
			image = publicURL;
		} catch (error: any) {
			console.error(error);
		}
	};

	onMount(getBook);
</script>

<svelte:head>
	{#if book}
		<title>{book.title}</title>
	{:else}
		<title>Ranobe DB</title>
	{/if}
</svelte:head>

<div class="">
	{#if image}
		<img src={image} alt="Cover image for {book.title}" width="240" height="340" />
	{/if}
	{#if book}
		<h1 class="text-2xl font-bold">{book.title}</h1>
		<br />
		<p>{@html book.description}</p>
	{:else}
		<p>loading</p>
	{/if}
	<br />
	<p><a href="/books" class="text-blue-500">Back to books</a></p>
</div>
