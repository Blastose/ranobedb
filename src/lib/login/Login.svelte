<script lang="ts">
	import { supabase } from '$lib/supabaseClient.js';

	let email = '';
	let password = '';

	const login = async () => {
		try {
			const { error } = await supabase.auth.signIn({ email });
			if (error) throw error;
		} catch (error: any) {
			console.log(error);
		} finally {
		}
	};
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold">Log In</h1>
		<form on:submit|preventDefault={login}>
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<label for="email">Email *</label>
					<input
						type="email"
						id="email"
						placeholder="example@example.com"
						class="bg-gray-200 px-3 py-2 rounded-md drop-shadow-sm"
						bind:value={email}
					/>
				</div>
				<div class="flex flex-col gap-1">
					<label for="password">Password *</label>
					<input
						type="password"
						id="password"
						class="bg-gray-200 px-4 py-2 rounded-md drop-shadow-sm"
						bind:value={password}
					/>
				</div>
				<div class="flex">
					<input
						type="submit"
						value="Log In"
						class="w-full text-white bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 cursor-pointer drop-shadow-sm"
					/>
				</div>
			</div>
		</form>
	</div>
</div>
