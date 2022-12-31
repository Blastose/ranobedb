<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';

	export let form: ActionData;
	let email: string = form?.email ?? '';
	let password: string = form?.password ?? '';
	let loading: boolean = false;
</script>

<svelte:head>
	<title>Login - RanobeDB</title>
</svelte:head>

<main class="mx-auto max-w-xl pt-4 px-4 flex flex-col gap-4">
	<h1 class="text-2xl font-bold">Log In</h1>
	{#if form?.error}
		<Alert type="error">
			<p>Invalid login credentials</p>
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
			/>

			<FormInput
				bind:value={password}
				name="password"
				id="password"
				type="password"
				labelName="Password"
				required={true}
				placeholder="Password"
			/>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Log In'} />
		</div>
	</Form>
	<p>
		Don't have an account yet? <a
			href="/signup"
			class="text-blue-600 dark:text-blue-400 hover:underline">Sign up</a
		> now!
	</p>
</main>
