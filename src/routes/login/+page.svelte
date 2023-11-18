<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	const form = superForm(data.form);
	const { enhance, message, delayed, submitting } = form;
</script>

<PageTitle title="Sign up" />

<main class="container-rndb flex justify-center">
	<AuthFormShell
		headingText="Log In"
		submitting={$submitting}
		delayed={$delayed}
		submitText="Log in"
		{enhance}
	>
		<svelte:fragment slot="alert">
			{#if !$delayed && $message}
				{#if $message.type === 'success'}
					<p>success</p>
				{:else}
					<p>error</p>
				{/if}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="form">
			<TextField
				{form}
				field={'email'}
				placeholder="Email"
				label="Email"
				showRequiredSymbolIfRequired={false}
			/>
			<TextField
				{form}
				field={'password'}
				type="password"
				placeholder="Password"
				label="Password"
				showRequiredSymbolIfRequired={false}
			/>
		</svelte:fragment>

		<svelte:fragment slot="bottom">
			<p>
				Don't have an account? <a href="/signup" class="login-text">Sign up</a> now!
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
