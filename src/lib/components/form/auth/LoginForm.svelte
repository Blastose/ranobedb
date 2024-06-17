<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import AuthFormShell from '$lib/components/form/auth/AuthFormShell.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';
	import type { loginSchema } from '$lib/server/zod/schema';

	export let loginForm: SuperValidated<Infer<typeof loginSchema>>;

	let turnstileKey = 0;

	const form = superForm(loginForm, {
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
	headingText="Log In"
	submitting={$submitting}
	delayed={$delayed}
	submitText="Log in"
	{turnstileKey}
	{enhance}
>
	<svelte:fragment slot="form">
		<TextField
			{form}
			field={'usernameemail'}
			placeholder=""
			label="Username or email"
			showRequiredSymbolIfRequired={false}
		/>
		<TextField
			{form}
			field={'password'}
			type="password"
			placeholder=""
			label="Password"
			showRequiredSymbolIfRequired={false}
		/>
	</svelte:fragment>

	<svelte:fragment slot="bottom">
		<div class="flex flex-col gap-1">
			<p>
				Don't have an account? <a href="/signup" class="link">Sign up</a> now!
			</p>
			<p><a href="/forgot-password" class="link">Forgot password?</a></p>
		</div>
	</svelte:fragment>
</AuthFormShell>
