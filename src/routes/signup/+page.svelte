<script lang="ts">
	import type { ActionData } from './$types';
	import Alert from '$lib/components/alert/Alert.svelte';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let form: ActionData;
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
				bind:value={username}
				name="username"
				id="username"
				type="text"
				labelName="Username"
				required={true}
				placeholder="Username"
				error={form?.usernameTaken
					? 'Username is already in use. Please use a different username'
					: form?.usernameInvalid
					? 'Username is required'
					: ''}
			/>

			<FormInput
				bind:value={password}
				name="password"
				id="password"
				type="password"
				labelName={'Password (6+ characters)'}
				required={true}
				placeholder="Password"
				error={form?.passwordInvalid ? 'Password must be between 6 and 255 characters' : ''}
			/>
		</div>

		<div slot="form-submit">
			<button
				disabled={loading}
				type="submit"
				class="duration-150 w-full flex justify-center text-white bg-primary-500 hover:bg-primary-800 rounded-md py-2 px-4 focus:outline-none focus:ring focus:ring-primary-600"
				>{#if !loading}
					Sign Up
				{:else}
					<Icon class="animate-spin" height="24" width="24" name="loading" />
				{/if}
			</button>
		</div>
	</Form>
	<p>
		Already have an account? <a href="/login" class="text-blue-400 hover:underline">Log in</a> now!
	</p>
</main>
