<script lang="ts">
	export let sidebarShow = true;
	export let toggleSidebar: () => void;
</script>

<header class="sticky top-0 bg-[#fafafa] drop-shadow-sm">
	<div class="container px-4 py-2 mx-auto duration-150">
		{#if !sidebarShow}
			<button on:click={toggleSidebar}><span class="text-2xl">=</span></button>
		{/if}
		<span class="text-2xl font-bold">Header</span>
	</div>
</header>
