<script lang="ts">
	import type { changeEmailSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Turnstile from '../../cf/Turnstile.svelte';
	import PasswordField from '../../PasswordField.svelte';
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
		email_verified: boolean;
	}
	let { changeEmailForm, email_verified }: Props = $props();
	let turnstileKey = $state(0);

	// svelte-ignore state_referenced_locally
	const sForm = superForm(changeEmailForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				turnstileKey++;
			}
			addToast({
				data: {
					title: f.message?.text || 'An unknown error has occurred.',
					type: f.message?.type ?? 'error',
				},
			});
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;

	let validToken: boolean = $derived(PUBLIC_CF_TURNSTILE_SITE_KEY === '1x00000000000000000000AA');
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/changeemail" class="flex max-w-lg flex-col gap-2" use:enhance>
	<div>
		<h2 class="text-lg font-bold">Change email</h2>
		{#if !email_verified}
			<p class="text-sm">Your current email is not verified.</p>
		{/if}
		<p class="text-sm">A verification email will be sent to your new email address</p>
	</div>

	<div class="flex flex-col gap-1">
		<TextField form={sForm} field={'current_email'} placeholder="Email" label="Current email" />
		<TextField form={sForm} field={'new_email'} placeholder="Email" label="New email" />
		<PasswordField
			form={sForm}
			field={'password'}
			placeholder="Password"
			label="Current password"
		/>
	</div>

	{#key turnstileKey}
		<Turnstile bind:validToken />
	{/key}

	<SubmitButton
		delayed={$delayed}
		submitting={$submitting}
		text={'Change email'}
		disabled={!validToken}
	/>
</form>
