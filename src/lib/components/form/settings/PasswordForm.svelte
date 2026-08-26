<script lang="ts">
	import type { passwordSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import PasswordField from '../PasswordField.svelte';

	interface Props {
		passwordForm: SuperValidated<Infer<typeof passwordSchema>>;
	}

	let { passwordForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(passwordForm, {
		onUpdated({ form }) {
			addToast({
				data: {
					title: form.message?.text || 'An unknown error has occurred.',
					type: form.message?.type ?? 'error',
				},
			});
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/password" class="flex max-w-lg flex-col gap-2" use:enhance>
	<div>
		<h2 class="text-lg font-bold">Update password</h2>
		<p class="text-sm">Changing your password will log you out of all other sessions</p>
	</div>

	<div class="flex flex-col gap-1">
		<PasswordField
			form={sForm}
			field={'currentPassword'}
			placeholder="Password"
			label="Current password"
		/>
		<PasswordField
			form={sForm}
			field={'newPassword'}
			placeholder="Password"
			label="New password (15+ characters)"
		/>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Update password'} />
</form>
