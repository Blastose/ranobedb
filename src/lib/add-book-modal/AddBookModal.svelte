<script lang="ts">
	import type Book from '$lib/models/book';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/db';
	import { getContext } from 'svelte';
	import { session } from '$app/stores';
	import { navigating } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	const { close } = getContext('simple-modal');

	export let book: Book;
	export let image: string;

	let loading = true;

	let readerId: number | null = null;
	let status: string | null = null;
	let selectStatus: string | null = 'Reading';
	let startDate: Date | null = null;
	let finishDate: Date | null = null;
	let labels: { label_name: string; label_id: number }[] | null = null;

	const addBook = async () => {
		const { data, error } = await supabaseClient.from('reads').insert([
			{
				reader_id: readerId,
				book_id: book.id,
				start_date: startDate,
				finish_date: finishDate,
				added_date: new Date()
			}
		]);

		const {} = await supabaseClient.from('reader_labels').insert([
			{
				reader_id: readerId,
				book_id: book.id,
				label_name: selectStatus
			}
		]);
	};

	const updateBook = async () => {
		const { data, error } = await supabaseClient
			.from('reads')
			.update({
				start_date: startDate,
				finish_date: finishDate
			})
			.match({ reader_id: readerId, book_id: book.id });
		const {} = await supabaseClient
			.from('reader_labels')
			.update({
				label_name: selectStatus
			})
			.match({ reader_id: readerId, book_id: book.id });
	};

	const removeBook = async () => {
		const { data, error } = await supabaseClient
			.from('reads')
			.delete()
			.match({ reader_id: readerId, book_id: book.id });

		const {} = await supabaseClient
			.from('reader_labels')
			.delete()
			.match({ reader_id: readerId, book_id: book.id });
	};

	const getUserId = async () => {
		const { data, error } = await supabaseClient
			.from('reader')
			.select('*')
			.match({ auth_id: $session.user.id })
			.single();
		return data.reader_id;
	};

	onMount(async () => {
		readerId = await getUserId();

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
			selectStatus = status;
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

		loading = false;
	});

	$: {
		if ($navigating) {
			close();
		}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-xl">Add book to reading list</span>
	<div class="grid grid-cols-[35%,_1fr] gap-6">
		<img class="shadow-sm rounded-sm" src={image} alt="Cover image for {book.title}" />
		<div class="flex flex-grow flex-col gap-4">
			<span class="text-lg font-semibold ">{book.title}</span>
			<form class="flex flex-col">
				<label for="startDate">Start date</label>
				<input
					class="bg-slate-200 p-2 rounded-md"
					type="date"
					name="startDate"
					id="startDate"
					bind:value={startDate}
				/>
				<label for="finishDate">Finish date</label>
				<input
					class="bg-slate-200 p-2 rounded-md"
					type="date"
					name="finishDate"
					id="finishDate"
					bind:value={finishDate}
				/>

				<label for="label">Status</label>
				<select
					bind:value={selectStatus}
					class="bg-slate-200 p-2 rounded-md"
					name="label"
					id="label"
				>
					{#if labels && status}
						{#each labels as label (label.label_id)}
							<option selected={label.label_name === status} value={label.label_name}>
								{label.label_name}
							</option>
						{/each}
					{/if}
				</select>
			</form>

			<div class="flex flex-col gap-2 sm:justify-between sm:flex-row">
				<button
					on:click={async () => {
						if (status === 'N/A') {
							await addBook();
						} else {
							await updateBook();
						}
						await invalidate($page.url.href);
						close();
					}}
					class=" w-min px-8 py-1 rounded-md text-white bg-slate-500"
				>
					{status === 'N/A' || status === null ? 'Add' : 'Update'}
				</button>
				{#if status !== 'N/A' && !loading}
					<button
						on:click={async () => {
							await removeBook();
							await invalidate($page.url.href);
							close();
						}}
						class=" w-fit px-8 py-1 rounded-md text-white bg-slate-500"
					>
						Remove
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
