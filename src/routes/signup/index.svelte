<script lang="ts">
	import Signup from '$lib/signup/Signup.svelte';
	import { user } from '$lib/stores/sessionStore';

	export let errors: Record<string, string> = {};
</script>

{#if !$user}
	<Signup {errors} />
{:else}
	<span>You are already logged in!</span>
{/if}
