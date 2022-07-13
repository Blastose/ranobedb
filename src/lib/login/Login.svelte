<script lang="ts">
	import { supabase } from '$lib/supabaseClient.js';
	import { goto } from '$app/navigation';
	import FormInput from '$lib/forms/FormInput.svelte';

	let email = '';
	let password = '';

	const login = async () => {
		try {
			const { error } = await supabase.auth.signIn({ email, password });
			if (error) throw error;
			goto('/');
		} catch (error: any) {
			console.log(error);
		} finally {
		}
	};

	const setPassword = async () => {
		try {
			const { error } = await supabase.auth.update({ password });
			if (error) throw error;
		} catch (error: any) {
			console.error(error);
		}
	};
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold">Log In</h1>
		<form on:submit|preventDefault={login}>
			<div class="flex flex-col gap-3">
				<FormInput
					bind:value={email}
					type="email"
					id="email"
					labelName="Email"
					placeholder="example@example.com"
					required={true}
				/>
				<FormInput
					bind:value={password}
					type="password"
					id="password"
					labelName="Password"
					placeholder=""
					required={true}
				/>
				<div class="flex">
					<input
						type="submit"
						value="Log In"
						class="w-full text-white bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 cursor-pointer drop-shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
					/>
				</div>
			</div>
		</form>
	</div>
</div>
