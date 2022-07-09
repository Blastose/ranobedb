<script lang="ts">
	import { page } from '$app/stores';

	export let sidebarShow = true;
	export let toggleSidebar: () => void;
</script>

<div class="duration-150 ease-in-out {sidebarShow ? '' : '-ml-64'} ">
	<nav
		class="flex flex-col overflow-y-scroll overflow-x-hidden h-screen w-64 sticky top-0 bg-[#e4e5f1]
    "
	>
		<button class="hover:bg-[#cdcedd] self-end px-4" on:click={toggleSidebar}>X</button>
		<a
			href="/"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/' ? 'bg-blue-200 hover:bg-blue-300' : ''}"
			>Link</a
		>
		<a
			href="/a"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/a'
				? 'bg-blue-200 hover:bg-blue-300'
				: ''}">Link</a
		>
		<a
			href="/b"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/b'
				? 'bg-blue-200 hover:bg-blue-300'
				: ''}">Link</a
		>
		<a
			href="/c"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/c'
				? 'bg-blue-200 hover:bg-blue-300'
				: ''}">Link</a
		>
		<a
			href="/d"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/d'
				? 'bg-blue-200 hover:bg-blue-300'
				: ''}">Link</a
		>
		<a
			href="/e"
			class="hover:bg-[#cdcedd] {$page.url.pathname === '/e'
				? 'bg-blue-200 hover:bg-blue-300'
				: ''}">Link</a
		>
	</nav>
</div>
