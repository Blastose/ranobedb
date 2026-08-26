<script lang="ts">
	import NameDisplayBoth from '$lib/components/display/NameDisplayBoth.svelte';
	import { staffRolesArray } from '$lib/db/dbConsts';
	import type { bookSchema } from '$lib/server/zod/schema';
	import type { ApiStaff } from '../../../../routes/api/i/staff/+server';
	import ComboboxInput from '../ComboboxInput.svelte';
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<Infer<typeof bookSchema>, App.Superforms.Message>;
		index: number;
	}

	let { form, index }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { values, errors, valueErrors } = arrayProxy(form, `editions[${index}].staff`);
	function handleRemoveStaff(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddStaff(staff_alias: ApiStaff[number]) {
		$values.push({
			name: staff_alias.name,
			romaji: staff_alias.romaji,
			note: '',
			role_type: 'author',
			staff_alias_id: staff_alias.id,
			staff_id: staff_alias.staff_id,
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/staff?name=${encodeURIComponent(inputValue)}`);
		const json = await res.json();
		return json;
	}
</script>

<div class="flex flex-wrap gap-6">
	{#each $values as staff, i}
		<div class="flex flex-col flex-wrap gap-2">
			<a class="link w-fit" target="_blank" rel="noreferrer" href="/staff/{staff.staff_id}"
				><span class="text-sm">#{staff.staff_id}:</span>
				<NameDisplayBoth
					obj={{ name: staff.name ?? '', romaji: staff.romaji ?? '' }}
					size="small"
				/></a
			>
			<label class="flex items-center gap-2"
				><span>Role: </span>
				<select name="staff-role" class="input reset-padding" bind:value={$values[i].role_type}>
					{#each staffRolesArray as role}
						<option value={role} selected={role === $values[i].role_type}>{role}</option>
					{/each}
				</select>
			</label>
			<label class="flex items-center gap-2"
				><span>Note: </span><input
					class="input reset-padding"
					type="text"
					bind:value={$values[i].note}
				/></label
			>
			{#if $valueErrors && $valueErrors[i]?.note}
				<p class="error-text-color">{$valueErrors[i]?.note}</p>
			{/if}
			<button
				onclick={() => {
					handleRemoveStaff(i);
				}}
				type="button"
				class="sub-btn w-fit">Remove</button
			>
		</div>
	{/each}
	<ComboboxInput
		handleAdd={handleAddStaff}
		{search}
		title="Add staff"
		selectedItems={[]}
		filterDuplicateIds={false}
		displayBothNames={true}
	/>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</div>
