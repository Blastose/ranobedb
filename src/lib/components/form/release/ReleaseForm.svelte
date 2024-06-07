<script lang="ts">
	import type { releaseSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { ReleaseEdit } from '$lib/server/db/releases/releases';
	import ReleasePublisherInput from './ReleasePublisherInput.svelte';
	import ReleaseBookInput from './ReleaseBookInput.svelte';
	import ReleaseDateInput from './ReleaseDateInput.svelte';
	import { languageNames, languagesArray, releaseFormatArray } from '$lib/db/dbConsts';
	import SelectField from '../SelectField.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import LinkInput from '../LinkInput.svelte';

	export let release: ReleaseEdit | undefined;
	export let releaseForm: SuperValidated<Infer<typeof releaseSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(releaseForm, {
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

<form method="post" class="flex flex-col gap-4" action={actionUrl} use:enhance>
	{#if release && type === 'edit'}
		<h1 class="font-bold text-xl">Editing <NameDisplay obj={release} /></h1>
	{:else}
		<h1 class="font-bold text-xl">Add release</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<TextField form={sForm} type="text" field="title" label="Title" placeholder="Title" />
	<TextField
		form={sForm}
		type="text"
		field="romaji"
		label="Romanization"
		placeholder="Romanization"
	/>

	<div class="flex gap-4">
		<SelectField
			form={sForm}
			field="lang"
			dropdownOptions={languagesArray.map((item) => ({
				display: languageNames[item],
				value: item,
			}))}
			selectedValue={release?.lang ?? 'ja'}
			label="Language"
			showRequiredSymbolIfRequired={false}
			resetPadding={true}
		/>
		<SelectField
			form={sForm}
			field="format"
			dropdownOptions={releaseFormatArray.map((item) => ({ display: item, value: item }))}
			selectedValue={release?.format ?? 'digital'}
			label="Format"
			showRequiredSymbolIfRequired={false}
			resetPadding={true}
		/>
	</div>

	<div class="flex gap-4">
		<TextField form={sForm} type="text" field="isbn13" label="ISBN 13" placeholder="ISBN 13" />
		<TextField
			form={sForm}
			type="number"
			field="pages"
			label="Number of pages"
			placeholder="Pages"
		/>
	</div>

	<ReleaseDateInput form={sForm} field="release_date" label="Release date" />

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		<div class="flex flex-col gap-2 max-w-md">
			<LinkInput form={sForm} field="website" label="Website" resetPadding={true} />

			<LinkInput form={sForm} field="amazon" label="Amazon" resetPadding={true} />

			<LinkInput form={sForm} field="bookwalker" label="Bookwalker" resetPadding={true} />

			<LinkInput form={sForm} field="rakuten" label="Rakuten" resetPadding={true} />
		</div>
	</section>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Note"
		textareaRows={4}
		placeholder="Note"
		labelId="description"
	/>

	<Hr />

	<ReleaseBookInput form={sForm} />
	<ReleasePublisherInput form={sForm} />

	<Hr />

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
