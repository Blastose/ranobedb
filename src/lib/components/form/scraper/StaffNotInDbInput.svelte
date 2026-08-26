<script lang="ts">
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { scrapedBookDataSchema } from '$lib/server/zod/schema';
	import { staffRolesArray } from '$lib/db/dbConsts';
	import TextField from '$lib/components/form/TextField.svelte';

	interface Props {
		form: SuperForm<Infer<typeof scrapedBookDataSchema>, App.Superforms.Message>;
	}

	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { values, errors, valueErrors } = arrayProxy(form, 'staff_not_in_db');

	function handleRemoveStaff(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}
</script>

{#if $values.length > 0}
	<section>
		<h4 class="font-bold">Staff not in DB (will be added)</h4>

		<div class="flex flex-wrap gap-6">
			{#each $values as _, i}
				<div class="flex flex-col flex-wrap gap-2">
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
			{#if $errors}
				<p class="error-text-color">{$errors}</p>
			{/if}
		</div>
	</section>
{/if}
