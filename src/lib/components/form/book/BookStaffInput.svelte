<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { staffRolesArray } from '$lib/db/dbConsts';
	import type { bookSchema } from '$lib/server/zod/schema';
	import type { ApiStaff } from '../../../../routes/api/i/staff/+server';
	import ComboboxInput from '../ComboboxInput.svelte';

	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';

	export let form: SuperForm<Infer<typeof bookSchema>, App.Superforms.Message>;
	export let index: number;

	const { values, errors, valueErrors } = arrayProxy(form, `editions[${index}].staff`);
	function handleRemoveStaff(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}

	function handleAddStaff(staff: ApiStaff[number]) {
		$values.push({
			name: staff.name,
			romaji: staff.romaji,
			note: '',
			role_type: 'author',
			staff_alias_id: staff.aid,
			staff_id: staff.id,
		});
		$values = $values;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/staff?name=${inputValue}`);
		const json = await res.json();
		return json;
	}
</script>

<div class="flex gap-6 flex-wrap">
	{#each $values as staff, i}
		<div class="flex flex-col gap-2 flex-wrap">
			<a class="link w-fit" target="_blank" rel="noreferrer" href="/staff/{staff.staff_id}"
				><span class="text-sm">#{staff.staff_id}:</span>
				<NameDisplay obj={{ name: staff.name ?? '', romaji: staff.romaji ?? '' }} /></a
			>
			<label class="flex gap-2 items-center"
				><span>Role: </span>
				<select name="staff-role" class="input reset-padding" bind:value={$values[i].role_type}>
					{#each staffRolesArray as role}
						<option value={role} selected={role === $values[i].role_type}>{role}</option>
					{/each}
				</select>
			</label>
			<label class="flex gap-2 items-center"
				><span>Note: </span><input
					class="input reset-padding"
					type="text"
					bind:value={$values[i].note}
				/></label
			>
			<button
				on:click={() => {
					handleRemoveStaff(i);
				}}
				type="button"
				class="sub-btn w-fit">Remove</button
			>
		</div>
	{/each}
	<ComboboxInput handleAdd={handleAddStaff} {search} title="Add staff" />
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</div>
