<script lang="ts">
	import type { bookSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import type { BookEdit } from '$lib/server/db/books/books';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from '$lib/server/lucia/lucia';
	import BookEditionStaffInput from './BookEditionStaffInput.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import TitlesInput from './TitlesInput.svelte';

	interface Props {
		book: BookEdit | undefined;
		bookForm: SuperValidated<Infer<typeof bookSchema>>;

		type: 'add' | 'edit';
		user: User | null;
		actionUrl?: string | undefined;
	}

	let { book, bookForm, type, user, actionUrl = undefined }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(bookForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
		taintedMessage: true,
	});
	const { form, enhance, delayed, submitting, errors } = sForm;

	let submitButtonText = $derived(type === 'add' ? 'Submit' : 'Submit edit');
</script>

<form method="post" class="flex flex-col gap-4" action={actionUrl} use:enhance>
	{#if book && type === 'edit'}
		<h1 class="text-xl font-bold">Editing {book.title ?? book.title_orig ?? 'book'}</h1>
	{:else}
		<h1 class="text-xl font-bold">Add book</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<TitlesInput form={sForm} field="titles" />

	<Hr />

	<TextareaFieldMarkdown
		form={sForm}
		field="description"
		label="Description"
		textareaRows={4}
		placeholder="Description"
		labelId="description-md"
	/>

	<TextareaFieldMarkdown
		form={sForm}
		field="description_ja"
		label="Description (Japanese)"
		textareaRows={4}
		placeholder="Description (Japanese)"
		labelId="descriptionjp-md"
	/>

	<Hr />

	<section>
		<p class="text-xl font-bold">Database relations:</p>
		<BookEditionStaffInput form={sForm} />
	</section>

	<Hr />

	<section class="flex flex-col gap-2">
		<div>
			<h2 class="text-xl font-bold">Cover image</h2>
			<p class="text-sm">Cover images had been moved to releases</p>
		</div>
	</section>

	<TextareaFieldMarkdown
		form={sForm}
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
		labelId="edit-summary"
	/>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={submitButtonText} />
</form>
