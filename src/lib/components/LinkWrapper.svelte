<script lang="ts">
	export let url: string | null = null;
</script>

{#if url}
	<a href={url}><slot /></a>
{:else}
	<slot />
{/if}
