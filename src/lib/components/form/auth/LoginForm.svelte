<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { loginSchema } from '$lib/server/zod/schema';
	import PasswordField from '../PasswordField.svelte';

	interface Props {
		loginForm: SuperValidated<Infer<typeof loginSchema>>;
	}

	let { loginForm }: Props = $props();
	let turnstileKey = $state(0);

	// svelte-ignore state_referenced_locally
	const form = superForm(loginForm, {
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
	headingText="Log In"
	submitting={$submitting}
	delayed={$delayed}
	submitText="Log in"
	{turnstileKey}
	{enhance}
>
	{#snippet form_shell()}
		<TextField
			{form}
			field={'usernameemail'}
			placeholder=""
			label="Username or email"
			showRequiredSymbolIfRequired={false}
		/>
		<PasswordField
			{form}
			field={'password'}
			placeholder=""
			label="Password"
			showRequiredSymbolIfRequired={false}
		/>
	{/snippet}

	{#snippet bottom()}
		<div class="flex flex-col gap-1">
			<p>
				Don't have an account? <a href="/signup" class="link">Sign up</a> now!
			</p>
			<p><a href="/forgot-password" class="link">Forgot password?</a></p>
		</div>
	{/snippet}
</AuthFormShell>
