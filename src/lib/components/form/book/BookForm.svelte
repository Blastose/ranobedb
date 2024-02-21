<script lang="ts">
	import type { bookSchema } from '$lib/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import BookTitlesInput from './BookTitlesInput.svelte';
	import BookStaffInput from './BookStaffInput.svelte';

	export let bookForm: SuperValidated<Infer<typeof bookSchema>>;
	export let type: 'add' | 'edit';

	$: sForm = superForm(bookForm, { dataType: 'json', resetForm: false });
	$: ({ form, enhance, delayed, submitting } = sForm);
</script>

<SuperDebug data={$form} />

<form method="post" class="container-rndb flex flex-col gap-4" use:enhance>
	<BookTitlesInput {form} />
	<BookStaffInput {form} />

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

	<TextField
		form={sForm}
		type="textarea"
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
	/>

	<input name="type" type="hidden" value={type} />

	<SubmitButton delayed={$delayed} submitting={$submitting} text="Submit edit" />
</form>
