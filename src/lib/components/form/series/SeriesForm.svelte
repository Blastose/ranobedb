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
	import { languageNames, languagesArray, seriesStatusArray } from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import TextFieldLink from '../TextFieldLink.svelte';
	import LinkInput from '../LinkInput.svelte';
	import ReleaseDateInput from '../release/ReleaseDateInput.svelte';
	import {
		aniDbLink,
		bookwalkerSeriesLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import SeriesTagInput from './SeriesTagInput.svelte';

	export let series: SeriesEdit | undefined;
	export let seriesForm: SuperValidated<Infer<typeof seriesSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(seriesForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" action={actionUrl} use:enhance>
	{#if series && type === 'edit'}
		<h1 class="font-bold text-xl">Editing <TitleDisplay obj={series} /></h1>
	{:else}
		<h1 class="font-bold text-xl">Add series</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<SeriesTitlesInput form={sForm} />

	<TextField
		form={sForm}
		type="textarea"
		field="aliases"
		label="Aliases"
		showRequiredSymbolIfRequired={false}
		placeholder="Aliases separated by new lines"
		textareaRows={3}
	/>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Note"
		textareaRows={4}
		placeholder="Note"
		labelId="description"
	/>

	<SelectField
		form={sForm}
		field="publication_status"
		dropdownOptions={seriesStatusArray.map((item) => ({
			display: item,
			value: item,
		}))}
		selectedValue={seriesForm.data.publication_status}
		label="Publication status"
		resetPadding={true}
		showRequiredSymbolIfRequired={false}
		fit={true}
	/>

	<SelectField
		form={sForm}
		field="olang"
		dropdownOptions={languagesArray.map((item) => ({
			display: languageNames[item],
			value: item,
		}))}
		selectedValue={seriesForm.data.olang}
		label="Language"
		showRequiredSymbolIfRequired={false}
		resetPadding={true}
		fit={true}
	/>

	<div class="flex flex-wrap gap-x-4">
		<ReleaseDateInput form={sForm} field="start_date" label="Start date" />
		<ReleaseDateInput form={sForm} field="end_date" label="End date" />
	</div>

	<div class="max-w-md">
		<LinkInput
			form={sForm}
			field="web_novel"
			label="Web novel"
			resetPadding={true}
			placeholder="Syosetu or Kakuyomu links"
		/>
	</div>

	<TextFieldLink
		form={sForm}
		type="number"
		field="anidb_id"
		label="AniDB id"
		resetPadding={true}
		linkBeforeAfter={aniDbLink}
	/>

	<TextFieldLink
		form={sForm}
		type="number"
		field="bookwalker_id"
		label="Bookwalker id"
		resetPadding={true}
		linkBeforeAfter={bookwalkerSeriesLink}
	/>

	<TextFieldLink
		form={sForm}
		type="number"
		field="wikidata_id"
		label="Wikidata id"
		resetPadding={true}
		linkBeforeAfter={wikidataLink}
	/>

	<Hr />

	<SeriesTagInput form={sForm} />

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
