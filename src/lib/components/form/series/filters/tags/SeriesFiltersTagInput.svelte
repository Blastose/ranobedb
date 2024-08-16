<script lang="ts">
	import type { seriesFiltersObjSchema } from '$lib/server/zod/schema';
	import ComboboxInput from '$lib/components/form/ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { ApiTag } from '../../../../../../routes/api/i/tags/+server';
	import TagFilter from './TagFilter.svelte';
	import HiddenInput from '$lib/components/form/HiddenInput.svelte';

	export let form: SuperForm<Infer<typeof seriesFiltersObjSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'tags');
	function handleRemoveTag(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddTag(tag: ApiTag[number]) {
		$values.push({ id: tag.id, name: tag.name, mode: 'incl', ttype: 'tag' });
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/tags?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

{#each $values.filter((v) => v.mode === 'incl' && v.ttype !== 'genre') as value}
	<HiddenInput name="tagsInclude" value={String(value.id)} />
{/each}
{#each $values.filter((v) => v.mode === 'excl' && v.ttype !== 'genre') as value}
	<HiddenInput name="tagsExclude" value={String(value.id)} />
{/each}

<div class="flex flex-col gap-1">
	<h2>Themes</h2>
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
			small={true}
		/>
		{#if $errors}
			<p class="error-text-color">{$errors}</p>
		{/if}
	</div>
</div>
