<script lang="ts">
	import { staffRolesArray } from '$lib/db/dbTypes';
	import type { bookSchema } from '$lib/zod/schema';
	import type { Writable } from 'svelte/store';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import ComboboxInput from '../ComboboxInput.svelte';

	export let form: Writable<SuperValidated<Infer<typeof bookSchema>>['data']>;

	function handleRemoveStaff(index: number) {
		$form.staff.splice(index, 1);
		$form.staff = $form.staff;
	}

	function handleAddStaff(staff: { id: number; name: string; alt_id?: number }) {
		$form.staff.push({
			name: staff.name,
			note: '',
			role_type: 'artist',
			staff_alias_id: staff.alt_id ?? staff.id,
			staff_id: staff.id
		});
		$form.staff = $form.staff;
	}

	async function search(inputValue: string) {
		const res = await fetch(`/api/i/staff?name=${inputValue}`);
		const json = await res.json();
		return json;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Staff</h2>
	<div class="flex gap-6 flex-wrap">
		{#each $form.staff as staff, i}
			<div class="flex flex-col gap-2 flex-wrap">
				<p><span class="text-sm opacity-70">#{staff.staff_id}:</span> {staff.name}</p>
				<label class="flex gap-2 items-center"
					><span>Role: </span>
					<select
						name="staff-role"
						class="input reset-padding"
						bind:value={$form.staff[i].role_type}
					>
						{#each staffRolesArray as role}
							<option value={role} selected={role === $form.staff[i].role_type}>{role}</option>
						{/each}
					</select>
				</label>
				<label class="flex gap-2 items-center"
					><span>Note: </span><input
						class="input reset-padding"
						type="text"
						bind:value={$form.staff[i].note}
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
		<ComboboxInput handleAdd={handleAddStaff} {search} />
	</div>
</section>
