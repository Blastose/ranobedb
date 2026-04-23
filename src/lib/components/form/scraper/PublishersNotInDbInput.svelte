<script lang="ts">
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import type { scrapedBookDataSchema } from '$lib/server/zod/schema';
	import { releasePublisherTypeArray } from '$lib/db/dbConsts';
	import TextField from '$lib/components/form/TextField.svelte';

	export let form: SuperForm<Infer<typeof scrapedBookDataSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'publishers_not_in_db');

	function handleRemovePublisher(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}
</script>

{#if $values.length > 0}
	<section>
		<h4 class="font-bold">Publishers not in DB (will be added)</h4>

		<div class="flex gap-6 flex-wrap">
			{#each $values as _, i}
				<div class="flex flex-col gap-2 flex-wrap">
					<TextField
						{form}
						type="text"
						field="publishers_not_in_db[{i}].name"
						label="Name"
						placeholder="Name"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
					/>
					<TextField
						{form}
						type="text"
						field="publishers_not_in_db[{i}].romaji"
						label="Romanization"
						placeholder="Romanization"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
					/>

					<label class="flex gap-2 items-center"
						><span>Type: </span>
						<select
							name="publisher-role"
							class="input reset-padding"
							bind:value={$values[i].publisher_type}
						>
							{#each releasePublisherTypeArray as rel_type}
								<option value={rel_type} selected={rel_type === $values[i].publisher_type}
									>{rel_type}</option
								>
							{/each}
						</select>
					</label>
					{#if $valueErrors && $valueErrors[i]?.note}
						<p class="error-text-color">{$valueErrors[i]?.note}</p>
					{/if}
					<button
						on:click={() => {
							handleRemovePublisher(i);
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
