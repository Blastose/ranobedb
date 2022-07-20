<script lang="ts">
	import Login from '$lib/login/Login.svelte';
	import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Login - Light Novel DB</title>
</svelte:head>

{#if !$session.user}
	<Login />
{:else}
	<h1>Hello {$session.user.email}</h1>
	<span>You are already logged in!</span>
{/if}
