<script lang="ts">
	export let sidebarShow = true;
	export let toggleSidebar: () => void;
</script>

<header class="sticky top-0 bg-[#fafafa] drop-shadow-sm p-4">
	{#if !sidebarShow}
		<button on:click={toggleSidebar}><span class="text-2xl">=</span></button>
	{/if}
	<span class="text-2xl font-bold">Header</span>
</header>
