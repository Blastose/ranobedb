<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let form: ActionData;
	let username: string = form?.username ?? '';
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
				bind:value={username}
				name="username"
				id="username"
				type="text"
				labelName="Username"
				required={true}
				placeholder="Username"
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
			<button
				disabled={loading}
				type="submit"
				class="duration-150 w-full flex justify-center text-white bg-primary-500 hover:bg-primary-800 
				{loading
					? 'bg-primary-800'
					: ''} rounded-md py-2 px-4 focus:outline-none focus:ring focus:ring-primary-600"
				>{#if !loading}
					Log In
				{:else}
					<Icon class="animate-spin" height="24" width="24" name="loading" />
				{/if}
			</button>
		</div>
	</Form>
	<p>
		Don't have an account yet? <a href="/signup" class="text-blue-400 hover:underline">Sign up</a> now!
	</p>
</main>
