<script lang="ts">
	import { releasePublisherTypeArray } from '$lib/db/dbConsts';
	import type { releaseSchema } from '$lib/server/zod/schema';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import ComboboxInput from '../ComboboxInput.svelte';
	import type { ApiPublisher } from '../../../../routes/api/i/publisher/+server';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	export let form: SuperForm<Infer<typeof releaseSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'publishers');
	function handleRemovePublisher(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddPublisher(publisher: ApiPublisher[number]) {
		$values.push({
			name: publisher.name,
			id: publisher.id,
			romaji: publisher.romaji,
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/publisher?name=${inputValue}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Publisher Relations</h2>
	<div class="flex gap-6 flex-wrap">
		{#each $values as publisher, i}
			<div class="flex flex-col gap-2 flex-wrap">
				<a class="link w-fit" target="_blank" rel="noreferrer" href="/publisher/{publisher.id}"
					><span class="text-sm">#{publisher.id}:</span> <NameDisplay obj={publisher} /></a
				>
				<label class="flex gap-2 items-center"
					><span>Type: </span>
					<select
						name="publisher-role"
						class="input reset-padding"
						bind:value={$values[i].publisher_type}
					>
						{#each releasePublisherTypeArray as rel_type}
							<option value={rel_type} selected={rel_type === $values[i].publisher_type}
								>{rel_type}</option
							>
						{/each}
					</select>
				</label>
				<button
					on:click={() => {
						handleRemovePublisher(i);
					}}
					type="button"
					class="sub-btn w-fit">Remove</button
				>
			</div>
		{/each}
		<ComboboxInput
			handleAdd={handleAddPublisher}
			{search}
			title="Add publisher"
			selectedItems={$values}
			filterDuplicateIds={false}
		/>
	</div>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
