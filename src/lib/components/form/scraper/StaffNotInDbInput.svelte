<script lang="ts">
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { scrapedBookDataSchema } from '$lib/server/zod/schema';
	import { staffRolesArray } from '$lib/db/dbConsts';
	import TextField from '$lib/components/form/TextField.svelte';

	export let form: SuperForm<Infer<typeof scrapedBookDataSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'staff_not_in_db');

	function handleRemoveStaff(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}
</script>

{#if $values.length > 0}
	<section>
		<h4 class="font-bold">Staff not in DB (will be added)</h4>

		<div class="flex gap-6 flex-wrap">
			{#each $values as _, i}
				<div class="flex flex-col gap-2 flex-wrap">
					<TextField
						{form}
						type="text"
						field="staff_not_in_db[{i}].name"
						label="Name"
						placeholder="Name"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
					/>
					<TextField
						{form}
						type="text"
						field="staff_not_in_db[{i}].romaji"
						label="Romanization"
						placeholder="Romanization"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
					/>

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
					{#if $valueErrors && $valueErrors[i]?.note}
						<p class="error-text-color">{$valueErrors[i]?.note}</p>
					{/if}
					<button
						on:click={() => {
							handleRemoveStaff(i);
						}}
						type="button"
						class="sub-btn w-fit">Remove</button
					>
				</div>
			{/each}
			{#if $errors}
				<p class="error-text-color">{$errors}</p>
			{/if}
		</div>
	</section>
{/if}
