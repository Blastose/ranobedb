<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';

	export let data;

	const form = superForm(data.form);
	const { enhance, message, delayed, submitting } = form;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
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
