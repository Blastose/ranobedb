<script lang="ts">
	import type Book from '$lib/models/book';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/db';
	import { getContext } from 'svelte';
	import { session } from '$app/stores';
	import { navigating } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';

	const { close } = getContext('simple-modal');

	export let book: Book;
	export let image: string;

	let loading = true;

	let readerId: number | null = null;
	let status: string | null = null;
	let selectStatus: string | null = 'Reading';
	let startDate: string = '';
	let finishDate: string = '';
	let labels: { label_name: string; label_id: number }[] | null = null;

	const addBook = async () => {
		const { data, error } = await supabaseClient.from('reads').insert([
			{
				reader_id: readerId,
				book_id: book.id,
				start_date: startDate.length !== 0 ? startDate : null,
				finish_date: finishDate.length !== 0 ? finishDate : null,
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
				start_date: startDate.length !== 0 ? startDate : null,
				finish_date: finishDate.length !== 0 ? finishDate : null
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

		if (data.length !== 0) {
			status = data[0].reader_labels[0].label_name;
			selectStatus = status;
			startDate = data[0].start_date || '';
			finishDate = data[0].finish_date || '';
		} else {
			status = 'N/A';
		}

		const { data: r } = await supabaseClient
			.from('reading_list_label')
			.select('*')
			.order('label_id');
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
	<div class="grid grid-rows-[min-content,_1fr] md:grid-cols-[35%,_1fr] gap-y-2 md:gap-x-4">
		<div class="grid grid-cols-[25%,_1fr] md:grid-cols-none md:grid-rows-[1fr,_min-content] gap-2">
			<img class="shadow-sm rounded-sm" src={image} alt="Cover image for {book.title}" />
			<span class="md:hidden text-lg font-semibold">{book.title}</span>
		</div>

		<div class="flex flex-grow flex-col gap-4">
			{#if loading}
				<div class="flex flex-grow items-center justify-center">
					<Icon class="animate-spin" name="loading" height="64" width="64" />
				</div>
			{:else}
				<!-- This span is repeated above but hidden depending on screen size. -->
				<!-- There might be a way to accomplish this with grid template areas -->
				<span class="hidden md:block text-lg font-semibold">{book.title}</span>
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

				<div class="flex flex-col gap-2">
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
						class="px-8 py-1 rounded-md text-white bg-slate-500 hover:bg-slate-600"
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
							class="px-8 py-1 rounded-md text-white bg-slate-500 hover:bg-slate-600"
						>
							Remove
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
