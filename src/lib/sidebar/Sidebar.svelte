<script lang="ts">
	let sidebarShow = true;
	function toggleSidebar() {
		sidebarShow = !sidebarShow;
	}
</script>

<div class="duration-150 ease-in-out {sidebarShow ? '' : '-ml-64'} ">
	<nav
		class="flex flex-col overflow-y-scroll overflow-x-hidden h-screen w-64 sticky top-0 bg-slate-200
    "
	>
		<button class="hover:bg-slate-400" on:click={toggleSidebar}>X</button>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
		<a href="/" class="hover:bg-slate-300">Link</a>
	</nav>
</div>
