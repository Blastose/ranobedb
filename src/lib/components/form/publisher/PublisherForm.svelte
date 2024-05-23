<script lang="ts">
	import type { publisherSchema } from '$lib/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { PublisherEdit } from '$lib/server/db/publishers/publishers';
	import PublisherRelInput from './PublisherRelInput.svelte';

	export let publisher: PublisherEdit | undefined;
	export let publisherForm: SuperValidated<Infer<typeof publisherSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	const sForm = superForm(publisherForm, {
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

<SuperDebug data={$form} />

<form method="post" class="flex flex-col gap-4" use:enhance>
	{#if publisher}
		<h1 class="font-bold text-xl">Editing {publisher.name ?? 'publisher'}</h1>
	{:else}
		<h1 class="font-bold text-xl">Add publisher</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<TextField form={sForm} type="text" field="name" label="Name" placeholder="Name" />
	<TextField
		form={sForm}
		type="text"
		field="romaji"
		label="Romanization"
		placeholder="Romanization"
	/>

	<TextField
		form={sForm}
		type="textarea"
		field="description"
		label="Biography"
		textareaRows={4}
		placeholder="Biography"
	/>

	<PublisherRelInput form={sForm} />

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
