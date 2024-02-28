<script lang="ts">
	import AccessDenied from './AccessDenied.svelte';

	export let canAccess: boolean;
</script>

{#if canAccess}
	<slot />
{:else}
	<AccessDenied />
{/if}
