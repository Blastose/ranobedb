<script lang="ts">
	import type { seriesSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { SeriesEdit } from '$lib/server/db/series/series';
	import SeriesTitlesInput from './SeriesTitlesInput.svelte';
	import SeriesBookInput from './SeriesBookInput.svelte';
	import SeriesRelInput from './SeriesRelInput.svelte';
	import SelectField from '../SelectField.svelte';
	import { seriesStatusArray } from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';

	export let series: SeriesEdit | undefined;
	export let seriesForm: SuperValidated<Infer<typeof seriesSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	const sForm = superForm(seriesForm, {
		dataType: 'json',
		resetForm: false,
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" use:enhance>
	{#if series}
		<h1 class="font-bold text-xl">Editing <TitleDisplay obj={series} /></h1>
	{:else}
		<h1 class="font-bold text-xl">Add series</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<SeriesTitlesInput form={sForm} />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Description"
		textareaRows={4}
		placeholder="Description"
		labelId="description"
	/>

	<div class="flex">
		<SelectField
			form={sForm}
			field="publication_status"
			dropdownOptions={seriesStatusArray.map((item) => ({
				display: item,
				value: item,
			}))}
			selectedValue={series?.publication_status ?? 'ongoing'}
			label="Publication status"
			resetPadding={true}
			showRequiredSymbolIfRequired={false}
		/>
	</div>

	<Hr />

	<SeriesBookInput form={sForm} />
	<SeriesRelInput form={sForm} seriesId={series?.id} />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
		labelId="edit-summary"
	/>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={submitButtonText} />
</form>
