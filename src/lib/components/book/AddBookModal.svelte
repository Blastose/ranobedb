<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';

	export let book: Pick<BookInfo, 'title' | 'cover_image_file_name'>;
	export let status: string | null;
	export let startDate: string | null;
	export let finishDate: string | null;
	let selectStatus: string | null = 'Reading';
	let labels: { label_name: string; label_id: number }[] = [{ label_name: 'Reading', label_id: 1 }];
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
			<form class="flex flex-col gap-1">
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
					bind:value={selectStatus}
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
			</form>

			<div class="flex flex-col gap-2">
				<button
					on:click={async () => {}}
					class="px-8 py-1 rounded-md text-white duration-150 bg-primary-500 hover:bg-primary-800"
				>
					{status === 'N/A' || status === null ? 'Add' : 'Update'}
				</button>
			</div>
		</div>
	</div>
</div>
