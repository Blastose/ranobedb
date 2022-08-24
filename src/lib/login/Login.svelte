<script lang="ts">
	import FormInput from '$lib/forms/FormInput.svelte';
	export let error: string;
	let email = '';
	let password = '';
	let remember = false;
</script>

<div class="max-w-xl mx-auto">
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold dark:text-white">Log In</h1>
		<form action="/login" method="POST">
			<div class="flex flex-col gap-3">
				{#if error}
					<div class="text-red-600">
						<span>{error}</span>
					</div>
				{/if}
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
				<div>
					<input
						bind:checked={remember}
						value={remember}
						type="checkbox"
						id="remember"
						name="remember"
						class="self-start"
					/>
					<label for="remember" class="dark:text-white">Remember me</label>
				</div>
				<div class="flex">
					<input
						type="submit"
						value="Log In"
						class="w-full text-white bg-primary-500 hover:bg-primary-700 rounded-md py-2 px-4 cursor-pointer drop-shadow-sm focus:outline-none focus:ring focus:ring-[#6b6e92]"
					/>
				</div>
			</div>
		</form>
	</div>
</div>
