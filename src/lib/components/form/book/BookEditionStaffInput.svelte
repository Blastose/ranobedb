<script lang="ts">
	import { type SuperForm, arrayProxy, type Infer } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SelectField from '../SelectField.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import BookStaffInput from './BookStaffInput.svelte';
	import type { bookSchema } from '$lib/server/zod/schema';
	import { languageNames, languagesArray } from '$lib/db/dbConsts';

	interface Props {
		form: SuperForm<Infer<typeof bookSchema>, App.Superforms.Message>;
	}

	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
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
			<div class="flex flex-wrap items-end gap-x-4 gap-y-2">
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
						fit={true}
					/>
					<button
						onclick={() => {
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
		class="primary-btn mt-2 w-fit"
		onclick={() => {
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
