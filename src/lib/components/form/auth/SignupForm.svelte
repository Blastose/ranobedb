<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { signupSchema } from '$lib/server/zod/schema';

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
		<TextField
			{form}
			field={'password'}
			type="password"
			placeholder="Password"
			label="Password (12+ characters)"
		/>
	</svelte:fragment>

	<svelte:fragment slot="bottom">
		<p>
			Already have an account? <a href="/login" class="link">Log in</a> now!
		</p>
	</svelte:fragment>
</AuthFormShell>
