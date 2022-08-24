<script lang="ts">
	import { enhance } from '$lib/signup/signup';
	import FormInput from '$lib/forms/FormInput.svelte';
	import Icon from '$lib/components/Icon.svelte';

	export let errors: Record<string, string> = {};
	let loading = false;

	const setErrors = (formErrors: Record<string, string>) => {
		errors = formErrors;
	};
	const setLoading = (newLoadingState: boolean) => {
		loading = newLoadingState;
	};

	let username = '';
	let email = '';
	let password = '';
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold dark:text-white">Sign up</h1>
		<form action="/signup" method="POST" use:enhance={[setErrors, setLoading]}>
			<div class="flex flex-col gap-4">
				{#if errors.requests}
					<div class="text-red-600">
						<span>Too many requests. Please wait 1 minute before trying to sign up again.</span>
					</div>
				{/if}
				<div class="flex flex-col">
					<span class="text-sm dark:text-white"
						>Your username must be unique, but it will not be used for logging in.</span
					>
					<FormInput
						bind:value={username}
						type="text"
						id="username"
						name="username"
						labelName="Username"
						placeholder="Username"
						required={true}
						error={errors.username}
					/>
				</div>
				<FormInput
					bind:value={email}
					type="email"
					id="email"
					name="email"
					labelName="Email"
					placeholder="example@example.com"
					required={true}
					error={errors.email}
				/>
				<FormInput
					bind:value={password}
					type="password"
					id="password"
					name="password"
					labelName="Password (6+ characters)"
					placeholder=""
					required={true}
					error={errors.password}
				/>
				<div class="flex">
					<button
						type="submit"
						disabled={loading}
						class="w-full flex justify-center text-white bg-primary-500 hover:bg-primary-700 rounded-md py-2 px-4 cursor-pointer drop-shadow-sm focus:outline-none focus:ring focus:ring-[#6b6e92]"
					>
						{#if !loading}
							Sign up
						{:else}
							<Icon class="animate-spin" height="24" width="24" name="loading" />
						{/if}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
