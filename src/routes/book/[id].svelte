<script lang="ts">
	import type Book from '$lib/models/book';

	export let book: Book;
	export let image: string;
</script>

<svelte:head>
	<title>{book.title} - Light Novel DB</title>
</svelte:head>

<div class="">
	<img src={image} alt="Cover image for {book.title}" width="240" height="340" />
	<br />
	<h1 class="text-2xl font-bold">{book.title}</h1>
	<br />
	<p>{@html book.description}</p>

	<br />
	<p><a href="/books" class="text-blue-500">Back to books</a></p>
</div>
