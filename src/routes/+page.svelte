<script lang="ts">
	import { signOut } from '@lucia-auth/sveltekit/client';
	import { invalidateAll } from '$app/navigation';

	import { getUser } from '@lucia-auth/sveltekit/client';
	const user = getUser();
</script>

<svelte:head>
	<title>RanobeDB</title>
</svelte:head>

<div class="w-full">
	<div class="px-8 py-2 mx-auto max-w-7xl">
		{#if $user}
			<p>{$user.userId ?? 'Not logged in'}</p>
		{/if}
		<div class="flex flex-col gap-2">
			<a class="px-4 py-2 w-fit rounded-md bg-slate-500 hover:bg-slate-600 text-white" href="/login"
				>Login</a
			>
			<a
				class="px-4 py-2 w-fit rounded-md bg-slate-500 hover:bg-slate-600 text-white"
				href="/signup">Sign up</a
			>
			<button
				class="px-4 py-2 w-fit rounded-md bg-slate-500 hover:bg-slate-600 text-white"
				on:click={async () => {
					await signOut();
					invalidateAll();
				}}>Sign out</button
			>
			<form method="POST" action="/signout">
				<button
					type="submit"
					class="px-4 py-2 w-fit rounded-md bg-slate-500 hover:bg-slate-600 text-white"
				>
					Sign out server
				</button>
			</form>
		</div>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1>Welcome to SvelteKit</h1>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
		<h1 class="text-3xl font-bold underline">Hello world!</h1>
	</div>
</div>
