<script lang="ts">
	import Alert from '$lib/components/alert/Alert.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import FormInput from '$lib/components/form2/FormInput.svelte';
	import AuthFormShell from '$lib/components/form2/AuthFormShell.svelte';

	export let data;

	const form = superForm(data.form);
	const { enhance, message, delayed } = form;
</script>

<svelte:head>
	<title>Login - RanobeDB</title>
</svelte:head>

<AuthFormShell topText="Log In" {enhance} loading={$delayed} buttonText="Log In">
	<svelte:fragment slot="alert">
		{#if $message}
			<Alert type={$message.status}>
				<p>{$message.text ?? 'Invalid login credentials'}</p>
			</Alert>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="form">
		<FormInput {form} field="email" type="email" label="Email" placeholder="example@example.com" />
		<FormInput {form} field="password" type="password" label="Password" placeholder="password" />
	</svelte:fragment>

	<svelte:fragment slot="bottom">
		<p>
			Don't have an account yet? <a
				href="/signup"
				class="text-blue-600 dark:text-blue-400 hover:underline">Sign up</a
			> now!
		</p>
	</svelte:fragment>
</AuthFormShell>
