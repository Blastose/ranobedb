<script lang="ts">
	import type Book from '$lib/models/book';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/db';
	import { getContext } from 'svelte';

	const { close } = getContext('simple-modal');

	export let book: Book;
	export let image: string;

	let status: string | null = null;
	let labels: { label_name: string; label_id: number }[] | null = null;
	onMount(async () => {
		const { data, error } = await supabaseClient
			.from('reads')
			.select(
				`
				*,
				reader_labels (label_name),
				reader (reader_id)
			`
			)
			.eq('book_id', book.id);
		console.log(data);
		status = data[0].reader_labels[0].label_name;

		const { data: r } = await supabaseClient
			.from('reading_list_label')
			.select('*')
			.order('label_id');
		console.log(r);
		labels = r;
	});
</script>

<div class="flex flex-col gap-2">
	<span class="text-xl">Add book to reading list</span>
	<div class="flex gap-2">
		<img
			class="shadow-sm rounded-sm"
			src={image}
			width="175px"
			alt="Cover image for {book.title}"
		/>
		<div class="flex flex-grow flex-col">
			<span class="font-semibold flex-grow">{book.title}</span>

			<select class="bg-slate-200 p-2 rounded-md" name="label" id="label">
				{#if labels && status}
					{#each labels as label (label.label_id)}
						<option selected={label.label_name === status} value={label.label_name}>
							{label.label_name}
						</option>
					{/each}
				{/if}
			</select>

			<button on:click={close} class="self-end w-fit px-8 py-1 rounded-md text-white bg-slate-500">
				Remove from list
			</button>
			<button on:click={close} class="self-end w-min px-8 py-1 rounded-md text-white bg-slate-500">
				Add
			</button>
		</div>
	</div>
</div>
