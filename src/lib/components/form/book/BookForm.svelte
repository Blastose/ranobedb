<script lang="ts">
	import type { bookSchema } from '$lib/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import BookTitlesInput from './BookTitlesInput.svelte';
	import BookStaffInput from './BookStaffInput.svelte';
	import type { BookEdit } from '$lib/server/db/books/books';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';

	export let book: BookEdit | undefined;
	export let bookForm: SuperValidated<Infer<typeof bookSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	$: sForm = superForm(bookForm, {
		dataType: 'json',
		resetForm: false,
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: 'Error in form!', type: 'error' } });
			}
		},
	});
	$: ({ form, enhance, delayed, submitting } = sForm);

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" use:enhance>
	{#if book}
		<h1 class="font-bold text-xl">Editing {book.title ?? book.title_orig ?? 'book'}</h1>
	{:else}
		<h1 class="font-bold text-xl">Add book</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<BookTitlesInput form={sForm} />

	<Hr />

	<TextField
		form={sForm}
		type="textarea"
		field="description"
		label="Description"
		textareaRows={4}
		placeholder="Description"
	/>

	<TextField
		form={sForm}
		type="textarea"
		field="description_ja"
		label="Description (japanese)"
		textareaRows={4}
		placeholder="Description (japanese)"
	/>

	<Hr />

	<section>
		<p class="font-bold text-xl">Database relations:</p>
		<BookStaffInput form={sForm} />
	</section>

	<Hr />

	<TextField
		form={sForm}
		type="textarea"
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
	/>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={submitButtonText} />
</form>
