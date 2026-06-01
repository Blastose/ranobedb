<script lang="ts">
	import type { seriesSchema } from '$lib/server/zod/schema';
	import ComboboxInput from '$lib/components/form/ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { ApiTag } from '../../../../routes/api/i/tags/+server';
	import TagFilter from './filters/tags/TagFilter.svelte';
	import { onMount } from 'svelte';

	export let form: SuperForm<Infer<typeof seriesSchema>, App.Superforms.Message>;

	const STORAGE_KEY = 'seriesTagInput:recentTags';
	const MAX_RECENT = 10;

	const { values, errors, valueErrors } = arrayProxy(form, 'tags');

	let recentTags: ApiTag = [];

	onMount(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				recentTags = JSON.parse(stored);
			} catch {}
		}
	});

	$: recentTagsFiltered = recentTags.filter((rt) => !$values.some((v) => v.id === rt.id));

	function saveRecent() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(recentTags));
	}

	function addToRecent(tag: ApiTag[number]) {
		recentTags = [tag, ...recentTags.filter((t) => t.id !== tag.id)].slice(0, MAX_RECENT);
		saveRecent();
	}

	function handleRemoveTag(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddTag(tag: ApiTag[number]) {
		$values.push({ id: tag.id, name: tag.name });
		$values = $values;
		addToRecent(tag);
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/tags?name=${encodeURIComponent(inputValue)}&all=true`);
		const json = await res.json();
		return json;
	}

	function clearRecent() {
		recentTags = [];
		localStorage.removeItem(STORAGE_KEY);
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

		{#if recentTagsFiltered.length > 0}
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium">Recently used tags:</span>
					<button type="button" onclick={clearRecent} class="sub-btn !text-xs !px-2 !py-0"
						>Clear</button
					>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each recentTags.filter((rt) => !$values.some((v) => v.id === rt.id)) as tag (tag.id)}
						<button
							type="button"
							onclick={() => handleAddTag(tag)}
							class="rounded-2xl tag-chip px-2 text-sm capitalize"
						>
							{tag.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if $errors}
			<p class="error-text-color">{$errors}</p>
		{/if}
	</div>
</div>
