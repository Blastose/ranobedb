<script lang="ts">
	import FormInput from '$lib/forms/FormInput.svelte';

	let email = '';
	let password = '';
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold">Log In</h1>
		<form action="/login" method="POST">
			<div class="flex flex-col gap-3">
				<FormInput
					bind:value={email}
					type="email"
					id="email"
					name="email"
					labelName="Email"
					placeholder="example@example.com"
					required={true}
				/>
				<FormInput
					bind:value={password}
					type="password"
					id="password"
					name="password"
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
