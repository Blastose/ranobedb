<script lang="ts">
	import type { bookSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import BookTitlesInput from './BookTitlesInput.svelte';
	import type { BookEdit } from '$lib/server/db/books/books';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import BookEditionStaffInput from './BookEditionStaffInput.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import ReleaseDateInput from '../release/ReleaseDateInput.svelte';
	import { languageNames, languagesArray } from '$lib/db/dbConsts';
	import SelectField from '../SelectField.svelte';

	export let book: BookEdit | undefined;
	export let bookForm: SuperValidated<Infer<typeof bookSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(bookForm, {
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
	{#if book && type === 'edit'}
		<h1 class="font-bold text-xl">Editing {book.title ?? book.title_orig ?? 'book'}</h1>
	{:else}
		<h1 class="font-bold text-xl">Add book</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<BookTitlesInput form={sForm} />

	<Hr />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Description"
		textareaRows={4}
		placeholder="Description"
		labelId="description-md"
	/>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description_ja"
		label="Description (japanese)"
		textareaRows={4}
		placeholder="Description (japanese)"
		labelId="descriptionjp-md"
	/>

	<SelectField
		form={sForm}
		field="olang"
		dropdownOptions={languagesArray.map((item) => ({
			display: languageNames[item],
			value: item,
		}))}
		selectedValue={bookForm.data.olang}
		label="Language"
		showRequiredSymbolIfRequired={false}
		resetPadding={true}
		fit={true}
	/>

	<ReleaseDateInput form={sForm} field="release_date" label="Release date" />

	<Hr />

	<section>
		<p class="font-bold text-xl">Database relations:</p>
		<BookEditionStaffInput form={sForm} />
	</section>

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
