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
	<title>Sign Up - RanobeDB</title>
</svelte:head>

<AuthFormShell topText="Sign Up" {enhance} loading={$delayed} buttonText="Sign Up">
	<svelte:fragment slot="alert">
		{#if !$delayed && $message}
			{#if $message.status === 'success'}
				<Alert type="success">
					<p>
						Successfully created an account. <a class="text-blue-800 hover:underline" href="/login"
							>Log in</a
						> now!
					</p>
				</Alert>
			{:else}
				<Alert type="error">
					<p>{$message.text}</p>
				</Alert>
			{/if}
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="form">
		<FormInput {form} field="email" type="email" label="Email" placeholder="example@example.com" />
		<FormInput {form} field="username" type="text" label="Username" placeholder="username" />
		<FormInput
			{form}
			field="password"
			type="password"
			label="Password (6+ characters)"
			placeholder="password"
		/>
	</svelte:fragment>

	<svelte:fragment slot="bottom">
		<p>
			Already have an account? <a
				href="/login"
				class="text-blue-600 dark:text-blue-400 hover:underline">Log in</a
			> now!
		</p>
	</svelte:fragment>
</AuthFormShell>
