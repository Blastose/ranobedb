<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import modalBook from '$lib/stores/modalBook';
	import toast from '$lib/stores/toast';
	import FormButtonLoad from '$lib/components/form/FormButtonLoad.svelte';

	export let book: Pick<BookInfo, 'id' | 'title' | 'cover_image_file_name'>;
	export let status: string | null;
	export let startDate: string | null;
	export let finishDate: string | null;
	let labels: { label_name: string; label_id: number }[] = [
		{ label_name: 'Reading', label_id: 1 },
		{ label_name: 'Finished', label_id: 2 },
		{ label_name: 'Plan to read', label_id: 3 },
		{ label_name: 'Dropped', label_id: 4 },
		{ label_name: 'On hold', label_id: 5 }
	];

	let newLoadingValue: 'add' | 'update' | 'remove' | null = null;
	let loading: 'add' | 'update' | 'remove' | null = null;
	let statusOption = status ?? 'Reading';
</script>

<div class="flex flex-col gap-2">
	<p class="text-xl">Add book to reading list</p>
	<div class="layout">
		<p class="title">{book.title}</p>
		<img class="image" src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg" alt="" />
		<form
			class="form"
			method="POST"
			action="/api/user/book/{book.id}"
			use:enhance={() => {
				loading = newLoadingValue;
				return async ({ result }) => {
					if (result.type === 'success') {
						await invalidateAll();
						modalBook.set(null);
						let message = 'Success';
						if (result.data?.message) {
							message = String(result.data?.message);
						}
						toast.set({
							message,
							closeButton: false,
							icon: 'checkCircle'
						});
					} else {
						toast.set({ message: 'An unknown error has occurred.', closeButton: false });
					}
					loading = null;
				};
			}}
		>
			<div class="flex flex-col gap-1">
				<label for="startDate">Start date</label>
				<input class="input" type="date" name="startDate" id="startDate" bind:value={startDate} />

				<label for="finishDate">Finish date</label>
				<input
					class="input"
					type="date"
					name="finishDate"
					id="finishDate"
					bind:value={finishDate}
				/>

				<label for="label">Status</label>
				<select bind:value={statusOption} class="input" name="label" id="label">
					{#each labels as label (label.label_id)}
						<option selected={label.label_name === status} value={label.label_name}>
							{label.label_name}
						</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-2">
				{#if status}
					<FormButtonLoad
						name="type"
						text="Update"
						value="update"
						onClick={() => {
							newLoadingValue = 'update';
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'update'}
					/>
					<FormButtonLoad
						name="type"
						text="Remove"
						value="remove"
						altColor={true}
						onClick={(e) => {
							if (!confirm('Are you sure you want to remove this book from your reading list?')) {
								e.preventDefault();
							} else {
								newLoadingValue = 'remove';
							}
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'remove'}
					/>
				{:else}
					<FormButtonLoad
						name="type"
						text="Add"
						value="add"
						onClick={() => {
							newLoadingValue = 'add';
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'add'}
					/>
				{/if}
			</div>
		</form>
	</div>
</div>

<style>
	.image {
		grid-area: image;
		border-radius: 0.125rem;
	}

	.title {
		grid-area: title;
		font-weight: 600;
	}

	.form {
		grid-area: form;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input {
		background-color: rgb(226 232 240);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	:global(.dark) .input {
		background-color: var(--dark-500);
	}

	.layout {
		display: grid;
		grid-template-areas:
			'image title'
			'form form';
		grid-template-columns: 25% 1fr;
		grid-template-rows: min-content min-content 1fr;
		column-gap: 1rem;
		row-gap: 1rem;
	}

	@media (min-width: 768px) {
		.layout {
			grid-template-areas:
				'image title'
				'image form';
			grid-template-columns: 35% 1fr;
			grid-template-rows: min-content min-content 1fr;
		}
	}
</style>
