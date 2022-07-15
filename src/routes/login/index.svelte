<script lang="ts">
	import Login from '$lib/login/Login.svelte';
	import { user } from '$lib/stores/sessionStore';
</script>

{#if !$user}
	<Login />
{:else}
	<span>You are already logged in!</span>
{/if}
