<script lang="ts">
	import type Book from '$lib/models/book';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/db';
	import { getContext } from 'svelte';
	import { session } from '$app/stores';
	import { navigating } from '$app/stores';

	const { close } = getContext('simple-modal');

	export let book: Book;
	export let image: string;

	let status: string | null = null;
	let startDate: Date | null = null;
	let finishDate: Date | null = null;
	let labels: { label_name: string; label_id: number }[] | null = null;
	onMount(async () => {
		const { data, error } = await supabaseClient
			.from('reads')
			.select(
				`
				*,
				reader_labels (label_name),
				reader!inner (reader_id)
			`
			)
			.eq('book_id', book.id)
			.eq('reader.auth_id', $session.user.id);
		console.log(data);

		if (data.length !== 0) {
			status = data[0].reader_labels[0].label_name;
			startDate = data[0].start_date;
			finishDate = data[0].finish_date;
		} else {
			status = 'N/A';
		}

		const { data: r } = await supabaseClient
			.from('reading_list_label')
			.select('*')
			.order('label_id');
		console.log(r);
		labels = r;
	});

	$: {
		if ($navigating) {
			close();
		}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-xl">Add book to reading list</span>
	<div class="grid grid-cols-[150px,_1fr] gap-2">
		<img class="shadow-sm rounded-sm" src={image} alt="Cover image for {book.title}" />
		<div class="flex flex-grow flex-col">
			<span class="font-semibold flex-grow">{book.title}</span>

			<form class="flex flex-col">
				<label for="startDate">Start date</label>
				<input
					class="bg-slate-200 p-2 rounded-md"
					type="date"
					name="startDate"
					id="startDate"
					value={startDate}
				/>
				<label for="finishDate">Finish date</label>
				<input
					class="bg-slate-200 p-2 rounded-md"
					type="date"
					name="finishDate"
					id="finishDate"
					value={finishDate}
				/>

				<label for="label">Status</label>
				<select class="bg-slate-200 p-2 rounded-md" name="label" id="label">
					{#if labels && status}
						{#each labels as label (label.label_id)}
							<option selected={label.label_name === status} value={label.label_name}>
								{label.label_name}
							</option>
						{/each}
					{/if}
				</select>
			</form>

			<button on:click={close} class="self-end w-fit px-8 py-1 rounded-md text-white bg-slate-500">
				Remove
			</button>
			<button on:click={close} class="self-end w-min px-8 py-1 rounded-md text-white bg-slate-500">
				Add
			</button>
		</div>
	</div>
</div>
