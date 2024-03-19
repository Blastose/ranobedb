<script lang="ts">
	import type { seriesSchema } from '$lib/zod/schema';
	import ComboboxInput from '../ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'books');
	function handleRemoveBook(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddBook(book: { id: number; name: string }) {
		$values.push({
			title: book.name,
			id: book.id,
			romaji: '',
			sort_order: $values.length
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/book?name=${inputValue}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Book Relations</h2>
	<div class="flex gap-2 flex-col">
		{#each $values as book, i}
			<div class="flex flex-wrap gap-2 items-center">
				<a class="link w-fit" target="_blank" rel="noreferrer" href="/book/{book.id}"
					><span class="text-sm">#{book.id}:</span> {book.title}</a
				>
				<button
					on:click={() => {
						handleRemoveBook(i);
					}}
					type="button"
					class="sub-btn w-fit">Remove</button
				>
			</div>
		{/each}
		<ComboboxInput handleAdd={handleAddBook} {search} title="Add book" />
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
