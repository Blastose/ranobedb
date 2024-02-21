<script lang="ts">
	import type { bookSchema } from '$lib/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import BookTitlesInput from './BookTitlesInput.svelte';
	import BookStaffInput from './BookStaffInput.svelte';
	import type { BookR } from '$lib/server/db/books/books';
	import Hr from '$lib/components/layout/Hr.svelte';

	export let book: BookR;
	export let bookForm: SuperValidated<Infer<typeof bookSchema>>;
	export let type: 'add' | 'edit';

	$: sForm = superForm(bookForm, { dataType: 'json', resetForm: false });
	$: ({ form, enhance, delayed, submitting } = sForm);
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" use:enhance>
	<h1 class="font-bold text-xl">Editing {book.title ?? book.title_orig ?? 'book'}</h1>

	<BookTitlesInput {form} />

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
		<BookStaffInput {form} />
	</section>

	<input name="type" type="hidden" value={type} />

	<Hr />

	<TextField
		form={sForm}
		type="textarea"
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
	/>

	<SubmitButton delayed={$delayed} submitting={$submitting} text="Submit edit" />
</form>
