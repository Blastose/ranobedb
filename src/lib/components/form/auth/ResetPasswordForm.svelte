<script lang="ts">
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { resetPasswordSchema } from '$lib/server/zod/schema';
	import PasswordField from '../PasswordField.svelte';

	interface Props {
		resetPasswordForm: SuperValidated<Infer<typeof resetPasswordSchema>>;
	}

	let { resetPasswordForm }: Props = $props();

	// svelte-ignore state_referenced_locally
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
	{#snippet form_shell()}
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
	{/snippet}
</AuthFormShell>
