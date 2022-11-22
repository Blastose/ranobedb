<script lang="ts">
	export let open: boolean;
</script>

<div class="drawer md:hidden">
	{#if open}
		<slot />
	{/if}
</div>

<style>
	.drawer {
		position: fixed;
		z-index: 50;
	}
</style>
