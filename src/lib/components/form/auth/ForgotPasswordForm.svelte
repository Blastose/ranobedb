<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { forgotPasswordSchema } from '$lib/server/zod/schema';

	interface Props {
		forgotPasswordForm: SuperValidated<Infer<typeof forgotPasswordSchema>>;
	}

	let { forgotPasswordForm }: Props = $props();
	let turnstileKey = $state(0);

	// svelte-ignore state_referenced_locally
	const form = superForm(forgotPasswordForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
				turnstileKey++;
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
	{turnstileKey}
	{enhance}
>
	{#snippet form_shell()}
		<p>Enter your email and we'll send you a link to reset your password.</p>

		<TextField
			{form}
			field={'email'}
			placeholder=""
			label="Email"
			showRequiredSymbolIfRequired={true}
		/>
	{/snippet}
</AuthFormShell>
