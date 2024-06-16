<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';
	import type { forgotPasswordSchema } from '$lib/server/zod/schema';

	export let forgotPasswordForm: SuperValidated<Infer<typeof forgotPasswordSchema>>;

	let turnstileKey = 0;

	const form = superForm(forgotPasswordForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
				if (PUBLIC_CF_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA') {
					turnstileKey++;
				}
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
	<svelte:fragment slot="form">
		<p>Enter your email and we'll send you a link to reset your password.</p>

		<TextField
			{form}
			field={'email'}
			placeholder=""
			label="Email"
			showRequiredSymbolIfRequired={true}
		/>
	</svelte:fragment>
</AuthFormShell>
