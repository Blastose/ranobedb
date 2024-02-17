<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms';

	export let data;

	$: form = superForm(data.form);
	$: ({ enhance, delayed, submitting } = form);
</script>

<PageTitle title="Sign up" />

<main class="container-rndb flex justify-center">
	<AuthFormShell
		headingText="Sign Up"
		submitting={$submitting}
		delayed={$delayed}
		submitText="Sign up"
		{enhance}
	>
		<svelte:fragment slot="alert">
			<!-- TOOD -->
		</svelte:fragment>

		<svelte:fragment slot="form">
			<TextField {form} field={'email'} placeholder="Email" label="Email" />
			<TextField {form} field={'username'} placeholder="Username" label="Username" />
			<TextField
				{form}
				field={'password'}
				type="password"
				placeholder="Password"
				label="Password (6+ characters)"
			/>
		</svelte:fragment>

		<svelte:fragment slot="bottom">
			<p>
				Already have an account? <a href="/login" class="login-text">Log in</a> now!
			</p>
		</svelte:fragment>
	</AuthFormShell>
</main>

<style>
	.login-text {
		color: var(--primary-600);
		text-decoration: underline;
	}

	:global(.dark) .login-text {
		color: var(--primary-400);
	}
</style>
