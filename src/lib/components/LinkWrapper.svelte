<script lang="ts">
	export let url: string | null = null;
</script>

{#if url}
	<a href={url} sveltekit:prefetch><slot /></a>
{:else}
	<slot />
{/if}
