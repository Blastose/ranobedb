<script lang="ts">
	import type { staffSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { StaffEdit } from '$lib/server/db/staff/staff';
	import StaffNamesInput from './StaffNamesInput.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	export let staff: StaffEdit | undefined;
	export let staffForm: SuperValidated<Infer<typeof staffSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	const sForm = superForm(staffForm, {
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
	{#if staff}
		<h1 class="font-bold text-xl">
			Editing <NameDisplay obj={staff} fallback="staff" />
		</h1>
	{:else}
		<h1 class="font-bold text-xl">Add staff</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<StaffNamesInput form={sForm} />

	<Hr />

	<section>
		<h2>Links</h2>
		<div class="flex flex-col gap-2">
			<TextField type="number" form={sForm} field="bookwalker_id" label="Bookwalker ID" />
			{#if $form.bookwalker_id}
				<a target="_blank" href="https://bookwalker.jp/author/{$form.bookwalker_id}" class="link"
					>Preview link</a
				>
			{/if}
		</div>
	</section>

	<Hr />

	<TextField
		form={sForm}
		type="textarea"
		field="description"
		label="Biography"
		textareaRows={4}
		placeholder="Biography"
	/>

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
