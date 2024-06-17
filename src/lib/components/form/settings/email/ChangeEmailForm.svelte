<script lang="ts">
	import type { changeEmailSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Turnstile from '../../cf/Turnstile.svelte';

	export let changeEmailForm: SuperValidated<Infer<typeof changeEmailSchema>>;
	export let email_verified: boolean;

	const sForm = superForm(changeEmailForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				// Do something
			}
		},
	});
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}

	let validToken: boolean;
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/changeemail" class="flex flex-col gap-2 max-w-lg" use:enhance>
	<div>
		<h2 class="font-bold text-lg">Change email</h2>
		{#if !email_verified}
			<p class="text-sm">Your current email is not verified.</p>
		{:else}
			<p class="text-sm"></p>
		{/if}
	</div>

	<div class="flex flex-col gap-1">
		<TextField form={sForm} field={'new_email'} placeholder="Email" label="New email" />
		<TextField
			form={sForm}
			field={'password'}
			type="password"
			placeholder="Password"
			label="Password"
		/>
	</div>

	<Turnstile bind:validToken />

	<SubmitButton
		delayed={$delayed}
		submitting={$submitting}
		text={'Change email'}
		disabled={!validToken}
	/>
</form>
