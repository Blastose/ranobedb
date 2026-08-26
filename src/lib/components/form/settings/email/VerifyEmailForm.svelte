<script lang="ts">
	import type { sendEmailVerificationSchema, verifyEmailSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Turnstile from '../../cf/Turnstile.svelte';
	import PasswordField from '../../PasswordField.svelte';
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';

	interface Props {
		sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
		verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
		email_verified: boolean;
	}

	let { sendEmailVerificationForm, verifyEmailForm, email_verified }: Props = $props();
	let turnstileKeyE = $state(0);
	let validToken: boolean = $derived(PUBLIC_CF_TURNSTILE_SITE_KEY === '1x00000000000000000000AA');

	// svelte-ignore state_referenced_locally
	const sFormEmailVerify = superForm(sendEmailVerificationForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				turnstileKeyE++;
			}
			addToast({
				data: {
					title: f.message?.text || 'An unknown error has occurred.',
					type: f.message?.type ?? 'error',
				},
			});
		},
	});
	const {
		form: formE,
		enhance: enhanceE,
		delayed: delayedE,
		submitting: submittingE,
		message: messageE,
	} = sFormEmailVerify;

	// svelte-ignore state_referenced_locally
	const sForm = superForm(verifyEmailForm, {
		onUpdated: async ({ form }) => {
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

{#if !email_verified}
	<div class="flex max-w-lg flex-col gap-2">
		<h2 class="text-lg font-bold">Verify email</h2>

		<p>
			You will receive a verification code in your email inbox. The code will be valid for 15
			minutes.
		</p>

		<form
			method="post"
			action="?/sendemailverificationcode"
			class="flex max-w-lg flex-col gap-2"
			use:enhanceE
		>
			<PasswordField
				form={sFormEmailVerify}
				field={'password'}
				placeholder="Password"
				label="Current password"
			/>

			{#key turnstileKeyE}
				<Turnstile bind:validToken />
			{/key}

			<SubmitButton
				delayed={$delayedE}
				submitting={$submittingE}
				text={'Send verification code'}
				disabled={!validToken}
			/>
		</form>

		<form method="post" action="?/verifyemail" class="flex max-w-lg flex-col gap-2" use:enhance>
			<div class="flex flex-col gap-1">
				<TextField form={sForm} field={'code'} type="text" placeholder="Code" label="Code" />
			</div>

			<SubmitButton delayed={$delayed} submitting={$submitting} text={'Verify'} />
		</form>
	</div>
{:else}
	<h2 class="text-lg font-bold">Verify email</h2>
	<p>Your email is verified</p>
{/if}
