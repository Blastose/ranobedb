<script lang="ts">
	let sidebarShow = true;
	function toggleSidebar() {
		sidebarShow = !sidebarShow;
	}
</script>

<div class="duration-150 ease-in-out {sidebarShow ? '' : '-ml-64'} ">
	<nav
		class="flex flex-col overflow-y-scroll overflow-x-hidden h-screen w-64 sticky top-0 bg-[#e4e5f1]
    "
	>
		<button class="hover:bg-[#cdcedd] self-end px-4" on:click={toggleSidebar}>X</button>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
		<a href="/" class="hover:bg-[#cdcedd]">Link</a>
	</nav>
</div>
