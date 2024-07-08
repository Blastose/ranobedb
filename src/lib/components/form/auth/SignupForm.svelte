<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { signupSchema } from '$lib/server/zod/schema';
	import CheckboxField from '../CheckboxField.svelte';
	import PasswordField from '../PasswordField.svelte';

	export let signupForm: SuperValidated<Infer<typeof signupSchema>>;

	let turnstileKey = 0;

	const form = superForm(signupForm, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
				turnstileKey++;
			}
		},
	});
	const { enhance, delayed, submitting, message } = form;
</script>

<AuthFormShell
	headingText="Sign Up"
	submitting={$submitting}
	delayed={$delayed}
	submitText="Sign up"
	{turnstileKey}
	{enhance}
>
	<svelte:fragment slot="form">
		<TextField {form} field={'email'} placeholder="Email" label="Email" />
		<TextField {form} field={'username'} placeholder="Username" label="Username" />
		<PasswordField
			{form}
			field={'password'}
			placeholder="Password"
			label="Password (15+ characters)"
		/>
		<PasswordField
			{form}
			field={'confirm_password'}
			placeholder="Confirm password"
			label="Confirm password"
		/>

		<CheckboxField {form} field="privacy_policy_cla" label="I have read and agree with the ">
			<a href="/about/privacy-policy" class="link" target="_blank">privacy policy </a> and
			<a href="/about/terms-of-use" class="link" target="_blank">terms of use.</a>
		</CheckboxField>
	</svelte:fragment>

	<svelte:fragment slot="bottom">
		<p>
			Already have an account? <a href="/login" class="link">Log in</a> now!
		</p>
	</svelte:fragment>
</AuthFormShell>
