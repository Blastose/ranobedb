<script lang="ts">
	import { supabase } from '$lib/supabaseClient.js';
	import FormInput from '$lib/forms/FormInput.svelte';

	let username = '';
	let email = '';
	let password = '';

	const signUp = async () => {
		try {
			const { error } = await supabase.auth.signUp({ email, password }, { data: { username } });
			if (error) throw error;
		} catch (error: any) {
			console.log(error);
		} finally {
		}
	};
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold">Sign up</h1>
		<form on:submit|preventDefault={signUp}>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col">
					<span class="text-sm"
						>Your username does not have to be unique and will not be used for logging in.</span
					>
					<FormInput
						bind:value={username}
						type="text"
						id="username"
						labelName="Username"
						placeholder="Username"
						required={true}
					/>
				</div>
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
						value="Sign up"
						class="w-full text-white bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 cursor-pointer drop-shadow-sm"
					/>
				</div>
			</div>
		</form>
	</div>
</div>
