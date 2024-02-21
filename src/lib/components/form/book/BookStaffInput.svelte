<script lang="ts">
	import { languageNames, type Language, staffRolesArray } from '$lib/db/dbTypes';
	import type { bookSchema } from '$lib/zod/schema';
	import type { Writable } from 'svelte/store';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let form: Writable<SuperValidated<Infer<typeof bookSchema>>['data']>;

	function handleRemoveStaff(index: number) {
		$form.staff.splice(index, 1);
		$form.staff = $form.staff;
	}
</script>

<h2>Staff</h2>
<div class="flex gap-6 flex-wrap">
	{#each $form.staff as staff, i}
		<div class="flex flex-col gap-2 flex-wrap">
			<p><span class="text-sm opacity-70">#{staff.staff_id}</span> {staff.name}</p>
			<label
				><span>Role: </span>
				<select name="staff-role" class="input reset-padding" bind:value={$form.staff[i].role_type}>
					{#each staffRolesArray as role}
						<option value={role}>{role}</option>
					{/each}
				</select>
			</label>
			<label
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
				class="sub-btn">Remove</button
			>
		</div>
	{/each}
</div>
<button type="button" class="sub-btn w-fit">Add staff</button>
