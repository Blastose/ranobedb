<script lang="ts">
	import type { ActionData } from './$types';
	import Alert from '$lib/components/alert/Alert.svelte';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';

	export let form: ActionData;
	let email: string = form?.email ?? '';
	let username: string = form?.username ?? '';
	let password: string;
	let loading: boolean = false;
</script>

<svelte:head>
	<title>Sign Up - RanobeDB</title>
</svelte:head>

<main class="mx-auto max-w-xl pt-4 px-4 flex flex-col gap-4">
	<h1 class="text-2xl font-bold">Sign Up</h1>
	{#if form?.success && !loading}
		<Alert type="success">
			<p>
				Successfully created an account. <a class="text-blue-800 hover:underline" href="/login"
					>Log in</a
				> now!
			</p></Alert
		>
	{/if}
	{#if form?.error && !loading}
		<Alert type="error">
			<p>An error has occurred creating your account. Please try again.</p>
		</Alert>
	{/if}

	<Form bind:loading>
		<div slot="form-input" class="flex flex-col gap-2">
			<FormInput
				bind:value={email}
				name="email"
				id="email"
				type="email"
				labelName="Email"
				required={true}
				placeholder="example@example.com"
				error={form?.emailError?.message ?? ''}
			/>

			<FormInput
				bind:value={username}
				name="username"
				id="username"
				type="text"
				labelName="Username"
				required={true}
				placeholder="Username"
				error={form?.usernameError?.message ?? ''}
			/>

			<FormInput
				bind:value={password}
				name="password"
				id="password"
				type="password"
				labelName={'Password (6+ characters)'}
				required={true}
				placeholder="Password"
				error={form?.passwordError?.message ?? ''}
			/>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Sign Up'} />
		</div>
	</Form>
	<p>
		Already have an account? <a
			href="/login"
			class="text-blue-600 dark:text-blue-400 hover:underline">Log in</a
		> now!
	</p>
</main>
