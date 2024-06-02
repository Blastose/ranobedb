<script lang="ts">
	import type { seriesSchema } from '$lib/server/zod/schema';
	import ComboboxInput from '../ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import BookDragDrop from './BookDragDrop.svelte';
	import type { ApiBook } from '../../../../routes/api/i/book/+server';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'books');
	function handleRemoveBook(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddBook(book: ApiBook[number]) {
		if ($values.some((item) => item.id === book.id)) return;
		$values.push({
			title: book.name,
			id: book.id,
			romaji: '',
			lang: book.lang,
			sort_order: $values.length + 1,
		});
		$values = $values;
	}

	function updateSortOrder() {
		for (const [index, item] of $values.entries()) {
			item.sort_order = index + 1;
		}
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/book?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Book Relations</h2>
	<div class="flex gap-2 flex-col">
		<BookDragDrop items={$values} remove={handleRemoveBook} {updateSortOrder} />
		<ComboboxInput
			handleAdd={handleAddBook}
			{search}
			title="Add book"
			selectedItems={$values}
			filterDuplicateIds={true}
		/>
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
