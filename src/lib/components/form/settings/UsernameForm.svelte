<script lang="ts">
	import type { usernameSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '../TextField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import PasswordField from '../PasswordField.svelte';

	export let usernameForm: SuperValidated<Infer<typeof usernameSchema>>;

	const sForm = superForm(usernameForm, { invalidateAll: 'force' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/username" class="flex flex-col gap-2" use:enhance>
	<h2 class="font-bold text-lg">Update username</h2>

	<div class="flex flex-col gap-1">
		<TextField form={sForm} field={'username'} placeholder="Username" label="New username" />
		<PasswordField
			form={sForm}
			field={'password'}
			placeholder="Password"
			label="Current password"
		/>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Update username'} />
</form>
