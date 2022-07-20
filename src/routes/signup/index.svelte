<script lang="ts">
	import Signup from '$lib/signup/Signup.svelte';
	import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Sign up - Light Novel DB</title>
</svelte:head>

{#if !$session.user}
	<Signup />
{:else}
	<span>You are already logged in!</span>
{/if}
