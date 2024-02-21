<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: book = data.book;
</script>

<PageTitle title={book.title ?? book.title_orig ?? ''} />

<div class="flex flex-col gap-2">
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>
	<p>aksdfjsjfkljasfjklejdjkalsejdjaeklsdj</p>

	<div>
		<Book {book} theme={data.theme} user={data.user} />
	</div>
</div>
