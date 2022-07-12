<script lang="ts">
	import Signup from '$lib/signup/Signup.svelte';
	import { user } from '$lib/sessionStore';
</script>

{#if !$user}
	<Signup />
{:else}
	<span>You are already logged in!</span>
{/if}
