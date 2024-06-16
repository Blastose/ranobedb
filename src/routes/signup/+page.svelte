<script lang="ts">
	import TextField from '$lib/components/form/TextField.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import AuthFormShell from '$lib/components/form/AuthFormShell.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';

	export let data;

	let turnstileKey = 0;

	const form = superForm(data.form, {
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
				turnstileKey++;
			}
		},
	});
	const { enhance, delayed, submitting, message } = form;
</script>

<PageTitle title="Sign up" />

<main class="container-rndb flex justify-center">
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
