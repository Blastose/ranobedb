<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';

	export let data;

	const form = superForm(data.form);
	const { enhance, delayed, submitting, message } = form;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
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
				Already have an account? <a href="/login" class="link">Log in</a> now!
			</p>
		</svelte:fragment>
	</AuthFormShell>
</main>
