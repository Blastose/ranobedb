<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { resetPasswordSchema } from '$lib/server/zod/schema';
	import PasswordField from '../PasswordField.svelte';

	export let resetPasswordForm: SuperValidated<Infer<typeof resetPasswordSchema>>;

	const form = superForm(resetPasswordForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { enhance, message, delayed, submitting } = form;
</script>

<AuthFormShell
	headingText="Reset your password"
	submitting={$submitting}
	delayed={$delayed}
	submitText="Reset password"
	turnstileKey={0}
	useTurnstile={false}
	{enhance}
>
	<svelte:fragment slot="form">
		<p class="text-sm">Resetting your password will log you out of all sessions</p>
		<PasswordField
			{form}
			field={'password'}
			placeholder=""
			label="Password (15+ characters)"
			showRequiredSymbolIfRequired={true}
		/>

		<PasswordField
			{form}
			field={'confirm_password'}
			placeholder=""
			label="Confirm password"
			showRequiredSymbolIfRequired={true}
		/>
	</svelte:fragment>
</AuthFormShell>
