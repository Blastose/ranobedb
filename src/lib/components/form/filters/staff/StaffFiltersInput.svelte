<script lang="ts">
	import type { staffFilters } from '$lib/server/zod/schema';
	import ComboboxInput from '$lib/components/form/ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { ApiStaff } from '../../../../../routes/api/i/staff/+server';
	import HiddenInput from '../../HiddenInput.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	export let form: SuperForm<Infer<typeof staffFilters>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'staff');
	function handleRemoveStaff(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddStaff(tag: ApiStaff[number]) {
		$values.push({ id: tag.id, name: tag.name, mode: 'incl', ttype: 'tag' });
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/staff?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

<div class="flex flex-col gap-1">
	<h2>Book staff</h2>
	{#each $values as value}
		<HiddenInput name="staff" value={String(value.id)} />
	{/each}
	<div class="flex gap-2 flex-col">
		<div class="flex flex-wrap gap-2">
			{#each $values as staff, i (staff.id)}
				<button
					class="flex gap-1 items-center rounded-2xl bg-neutral-700 px-2 text-sm"
					on:click={() => {
						handleRemoveStaff(i);
					}}><NameDisplay obj={staff} /><Icon name="close" height="18" width="18"></Icon></button
				>
			{:else}
				<p class="italic">No staff selected</p>
			{/each}
		</div>
		<ComboboxInput
			handleAdd={handleAddStaff}
			{search}
			title="Add staff"
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
