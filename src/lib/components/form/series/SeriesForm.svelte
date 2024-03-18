<script lang="ts">
	import type { seriesSchema } from '$lib/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { SeriesEdit } from '$lib/server/db/series/series';

	export let series: SeriesEdit | undefined;
	export let seriesForm: SuperValidated<Infer<typeof seriesSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	$: sForm = superForm(seriesForm, {
		dataType: 'json',
		resetForm: false,
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: 'Error in form!', type: 'error' } });
			}
		}
	});
	$: ({ form, enhance, delayed, submitting } = sForm);

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<SuperDebug data={$form} />

<form method="post" class="flex flex-col gap-4" use:enhance>
	{#if series}
		<h1 class="font-bold text-xl">Editing {series.title ?? 'series'}</h1>
	{:else}
		<h1 class="font-bold text-xl">Add series</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

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
