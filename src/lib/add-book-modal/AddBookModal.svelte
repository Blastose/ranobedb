<script lang="ts">
	import type Book from '$lib/models/book';

	export let book: Book;
	export let image: string;
</script>

<div class="flex flex-col gap-2">
	<span class="font-bold">Add book to reading list</span>
	<div class="flex gap-2">
		<img
			class="shadow-sm rounded-sm"
			src={image}
			width="150px"
			alt="Cover image for {book.title}"
		/>
		<div class="flex flex-col">
			<span class="flex-grow">{book.title}</span>
			<button class="self-end w-min px-2 py-1 rounded-md text-white bg-slate-500">Add</button>
		</div>
	</div>
</div>
