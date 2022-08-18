<script lang="ts">
	import Signup from '$lib/signup/Signup.svelte';
	import { session } from '$app/stores';

	export let errors: Record<string, string> = {};
</script>

<svelte:head>
	<title>Sign up - Light Novel DB</title>
</svelte:head>

<main class="container mx-auto px-8 py-4 duration-150">
	{#if !$session.user}
		<Signup {errors} />
	{:else}
		<span>You are already logged in!</span>
	{/if}
</main>
