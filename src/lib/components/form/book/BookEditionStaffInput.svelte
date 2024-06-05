<script lang="ts">
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SelectField from '../SelectField.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import BookStaffInput from './BookStaffInput.svelte';
	import type { bookSchema } from '$lib/server/zod/schema';
	import { languageNames, languagesArray } from '$lib/db/dbConsts';

	export let form: SuperForm<Infer<typeof bookSchema>, App.Superforms.Message>;

	const { values, errors, valueErrors } = arrayProxy(form, 'editions');

	function handleRemoveEdition(index: number) {
		$values.splice(index, 1);
		$values = $values;
	}
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Editions</h2>
	{#each $values as edition, editionIndex}
		<div class="flex flex-col gap-2">
			<p class="font-bold">{edition.title}</p>
			<div class="flex gap-x-4 gap-y-2 items-end flex-wrap">
				<TextField
					{form}
					type="text"
					field="editions[{editionIndex}].title"
					label="Title"
					placeholder="Title"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
					disabled={editionIndex === 0}
				/>
				{#if editionIndex !== 0}
					<SelectField
						{form}
						field="editions[{editionIndex}].lang"
						dropdownOptions={languagesArray.map((item) => ({
							display: languageNames[item],
							value: item,
						}))}
						selectedValue={edition.lang ?? 'ja'}
						label="Language"
						resetPadding={true}
						showRequiredSymbolIfRequired={false}
					/>
					<button
						on:click={() => {
							handleRemoveEdition(editionIndex);
						}}
						type="button"
						class="sub-btn h-fit w-fit">Remove edition</button
					>
				{/if}
			</div>
		</div>

		<BookStaffInput {form} index={editionIndex} />

		{#if editionIndex !== $values.length - 1}
			<Hr />
		{/if}
	{/each}

	<button
		type="button"
		class="primary-btn w-fit mt-2"
		on:click={() => {
			$values.push({
				staff: [],
				lang: 'ja',
				title: 'New edition',
			});
			$values = $values;
		}}>Add edition</button
	>
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</section>
