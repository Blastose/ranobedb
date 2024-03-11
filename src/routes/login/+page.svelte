<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms';
	import Alert from '$lib/components/layout/Alert.svelte';

	export let data;

	$: form = superForm(data.form);
	$: ({ enhance, message, delayed, submitting } = form);
</script>

<PageTitle title="Log in" />

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
				<Alert type={$message.type}>
					<p>{$message.text}</p>
				</Alert>
			{/if}
		</svelte:fragment>

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
			<p>
				Don't have an account? <a href="/signup" class="link">Sign up</a> now!
			</p>
		</svelte:fragment>
	</AuthFormShell>
</main>
