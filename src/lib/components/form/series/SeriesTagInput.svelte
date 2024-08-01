<script lang="ts">
	import type { seriesSchema } from '$lib/server/zod/schema';
	import ComboboxInput from '$lib/components/form/ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { ApiTag } from '../../../../routes/api/i/tags/+server';
	import TagFilter from './filters/tags/TagFilter.svelte';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'tags');
	function handleRemoveTag(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddTag(tag: ApiTag[number]) {
		$values.push({ id: tag.id, name: tag.name });
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/tags?name=${encodeURIComponent(inputValue)}&all=true`);
		const json = await res.json();
		return json;
	}
</script>

<div class="flex flex-col gap-1">
	<h2>Tags</h2>
	<div class="flex gap-2 flex-col">
		<div class="flex flex-wrap gap-2">
			{#each $values as tag, i (tag.id)}
				<TagFilter
					bind:genre={tag}
					removable={true}
					handleRemove={() => {
						handleRemoveTag(i);
					}}
				/>
			{:else}
				<p class="italic">No tags selected</p>
			{/each}
		</div>
		<ComboboxInput
			handleAdd={handleAddTag}
			{search}
			title="Add tag"
			selectedItems={$values}
			filterDuplicateIds={true}
			capitalize={true}
		/>
		{#if $errors}
			<p class="error-text-color">{$errors}</p>
		{/if}
	</div>
</div>
