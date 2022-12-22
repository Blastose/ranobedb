<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { enhance } from '$app/forms';
	import { modal } from '$lib/stores/modalStore';
	import { invalidateAll } from '$app/navigation';

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

	let statusOption = status ?? 'Reading';
</script>

<div class="flex flex-col gap-2">
	<span class="text-xl dark:text-white">Add book to reading list</span>
	<div class="grid grid-rows-[min-content,_1fr] md:grid-cols-[35%,_1fr] gap-y-2 md:gap-x-4">
		<div class="grid grid-cols-[25%,_1fr] md:grid-cols-none md:grid-rows-[1fr,_min-content] gap-4">
			<img
				class="shadow-sm rounded-sm"
				src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg"
				alt=""
			/>
			<span class="md:hidden text-lg font-semibold dark:text-white">{book.title}</span>
		</div>

		<div class="flex flex-grow flex-col gap-4">
			<!-- This span is repeated above but hidden depending on screen size. -->
			<!-- There might be a way to accomplish this with grid template areas -->
			<span class="hidden md:block text-lg font-semibold dark:text-white">{book.title}</span>
			<form
				class="flex flex-col gap-4"
				method="POST"
				action="/api/book/{book.id}/add"
				use:enhance={() => {
					return async ({ result }) => {
						console.log(result);
						modal.set(false);
						invalidateAll();
					};
				}}
			>
				<div class="flex flex-col gap-1">
					<label for="startDate" class="dark:text-white">Start date</label>
					<input
						class="bg-slate-200 p-2 rounded-md dark:text-white dark:bg-dark-500"
						type="date"
						name="startDate"
						id="startDate"
						bind:value={startDate}
					/>
					<label for="finishDate" class="dark:text-white">Finish date</label>
					<input
						class="bg-slate-200 p-2 rounded-md dark:text-white dark:bg-dark-500"
						type="date"
						name="finishDate"
						id="finishDate"
						bind:value={finishDate}
					/>

					<label for="label" class="dark:text-white">Status</label>
					<select
						bind:value={statusOption}
						class="bg-slate-200 p-2 rounded-md dark:text-white dark:bg-dark-500"
						name="label"
						id="label"
					>
						{#each labels as label (label.label_id)}
							<option selected={label.label_name === status} value={label.label_name}>
								{label.label_name}
							</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-2">
					{#if status}
						<button
							type="submit"
							name="type"
							value="update"
							class="px-8 py-1 rounded-md text-white duration-150 bg-primary-500 hover:bg-primary-800"
						>
							Update
						</button>
						<button
							on:click={async (e) => {
								if (!confirm('Are you sure you want to remove this book from your reading list?')) {
									e.preventDefault();
								}
							}}
							type="submit"
							name="type"
							value="remove"
							class="
							px-8 py-1 rounded-md text-white duration-150
							bg-[#747490] hover:bg-[#5e5e72]
							dark:bg-[#737387] dark:hover:bg-[#5e5e72]
							"
						>
							Remove
						</button>
					{:else}
						<button
							type="submit"
							name="type"
							value="add"
							class="px-8 py-1 rounded-md text-white duration-150 bg-primary-500 hover:bg-primary-800"
						>
							Add
						</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
</div>

<style>
</style>
