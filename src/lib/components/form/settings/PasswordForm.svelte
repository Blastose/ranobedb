<script lang="ts">
	import type { passwordSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import PasswordField from '../PasswordField.svelte';

	export let passwordForm: SuperValidated<Infer<typeof passwordSchema>>;

	const sForm = superForm(passwordForm);
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/password" class="flex flex-col gap-2 max-w-lg" use:enhance>
	<div>
		<h2 class="font-bold text-lg">Update password</h2>
		<p class="text-sm">Changing your password will log you out of all other sessions</p>
	</div>

	<div class="flex flex-col gap-1">
		<PasswordField
			form={sForm}
			field={'currentPassword'}
			placeholder="Password"
			label="Current password"
		/>
		<PasswordField form={sForm} field={'newPassword'} placeholder="Password" label="New password" />
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Update password'} />
</form>
