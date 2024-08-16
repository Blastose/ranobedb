<script lang="ts">
	import type { publisherFilters } from '$lib/server/zod/schema';
	import ComboboxInput from '$lib/components/form/ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import HiddenInput from '../../HiddenInput.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { ApiPublisher } from '../../../../../routes/api/i/publisher/+server';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	export let form: SuperForm<Infer<typeof publisherFilters>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'p');
	function handleRemovePublisher(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddPublisher(publisher: ApiPublisher[number]) {
		$values.push({ id: publisher.id, name: publisher.name, romaji: publisher.romaji });
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/publisher?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

<div class="flex flex-col gap-1">
	<h2>Release publisher</h2>
	{#each $values as value}
		<HiddenInput name="p" value={String(value.id)} />
	{/each}
	<div class="flex gap-2 flex-col">
		<div class="flex flex-wrap gap-2">
			{#each $values as publisher, i (publisher.id)}
				<button
					class="flex gap-1 items-center rounded-2xl tag-chip px-2 text-sm"
					type="button"
					on:click={() => {
						handleRemovePublisher(i);
					}}
					><NameDisplay obj={publisher} /><Icon name="close" height="18" width="18"></Icon></button
				>
			{:else}
				<p class="italic text-sm">No publishers selected</p>
			{/each}
		</div>
		<ComboboxInput
			handleAdd={handleAddPublisher}
			{search}
			title="Add publisher"
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
