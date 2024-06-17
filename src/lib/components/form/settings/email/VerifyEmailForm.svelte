<script lang="ts">
	import type { sendEmailVerificationSchema, verifyEmailSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Turnstile from '../../cf/Turnstile.svelte';
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';

	export let sendEmailVerificationForm: SuperValidated<Infer<typeof sendEmailVerificationSchema>>;
	export let verifyEmailForm: SuperValidated<Infer<typeof verifyEmailSchema>>;
	export let email_verified: boolean;

	let turnstileKeyE = 0;

	const sFormEmailVerify = superForm(sendEmailVerificationForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				if (PUBLIC_CF_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA') {
					turnstileKeyE++;
				}
			}
		},
	});
	const {
		form: formE,
		enhance: enhanceE,
		delayed: delayedE,
		submitting: submittingE,
		message: messageE,
	} = sFormEmailVerify;

	$: if (!$delayedE && $messageE) {
		addToast({ data: { title: $messageE.text, type: $messageE.type } });
	}

	let validToken: boolean;

	//

	const sForm = superForm(verifyEmailForm);
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<!-- <SuperDebug data={$form} /> -->

{#if !email_verified}
	<div class="flex flex-col gap-2 max-w-lg">
		<h2 class="font-bold text-lg">Verify email</h2>

		<p>
			You will receive a verification code in your email inbox. The code will be valid for 15
			minutes.
		</p>

		<form
			method="post"
			action="?/sendemailverificationcode"
			class="flex flex-col gap-2 max-w-lg"
			use:enhanceE
		>
			<TextField
				form={sFormEmailVerify}
				field={'password'}
				type="password"
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

		<form method="post" action="?/verifyemail" class="flex flex-col gap-2 max-w-lg" use:enhance>
			<div class="flex flex-col gap-1">
				<TextField form={sForm} field={'code'} type="text" placeholder="Code" label="Code" />
			</div>

			<SubmitButton delayed={$delayed} submitting={$submitting} text={'Verify email'} />
		</form>
	</div>
{:else}
	<h2 class="font-bold text-lg">Verify email</h2>
	<p>Your email is verified</p>
{/if}
