<script lang="ts">
	import Login from '$lib/login/Login.svelte';
	import { session } from '$app/stores';

	export let error: string = '';
</script>

{#if !$session.user}
	<Login {error} />
{:else}
	<h1>Hello {$session.user.email}</h1>
	<span>You are already logged in!</span>
{/if}
