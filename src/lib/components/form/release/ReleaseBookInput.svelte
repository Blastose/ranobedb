<script lang="ts">
	import { releaseTypeArray } from '$lib/db/dbConsts';
	import type { releaseSchema } from '$lib/server/zod/schema';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import ComboboxInput from '../ComboboxInput.svelte';
	import type { ApiBook } from '../../../../routes/api/i/book/+server';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';

	export let form: SuperForm<Infer<typeof releaseSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'books');
	function handleRemoveBook(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddBook(book: ApiBook[number]) {
		$values.push({
			title: book.name,
			id: book.id,
			romaji: book.romaji,
			lang: book.lang,
			rtype: 'complete',
		});
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
		{#each $values as book, i}
			<div class="flex flex-wrap gap-2 items-center">
				<a class="link w-fit" target="_blank" rel="noreferrer" href="/book/{book.id}"
					><span class="text-sm">#{book.id}:</span>
					<TitleDisplay
						obj={{
							lang: book.lang ?? 'en',
							romaji: book.romaji ?? '',
							romaji_orig: null,
							title: book.title ?? '',
							title_orig: '',
						}}
					/></a
				>
				<label class="flex gap-2 items-center"
					><span>Type: </span>
					<select name="book-type" class="input reset-padding" bind:value={$values[i].rtype}>
						{#each releaseTypeArray as rel_type (rel_type)}
							<option value={rel_type} selected={rel_type === $values[i].rtype}>{rel_type}</option>
						{/each}
					</select>
				</label>
				<button
					on:click={() => {
						handleRemoveBook(i);
					}}
					type="button"
					class="sub-btn w-fit">Remove</button
				>
			</div>
		{/each}
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
