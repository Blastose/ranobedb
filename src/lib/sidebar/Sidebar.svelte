<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';

	export let sidebarShow = true;
	export let toggleSidebar: () => void;
	let width: number = 1000;
</script>

<svelte:window bind:innerWidth={width} />

<div
	class="duration-150 ease-in-out     
	{width <= 1000 ? 'fixed z-10 flex' : ''}
	{width <= 1000 && sidebarShow ? 'w-full' : ''}
	{sidebarShow ? '' : '-ml-64'}"
>
	{#if sidebarShow && width <= 1000}
		<div on:click={toggleSidebar} class="w-[200%] h-screen bg-gray-700 opacity-50 fixed z-9" />
	{/if}
	<nav
		class="overflow-y-scroll overflow-x-auto h-screen w-64 sticky top-0 bg-[#e4e7ee] drop-shadow-sm
    "
	>
		<div class="px-4 flex flex-col">
			<button class="hover:bg-[#cdcedd] self-end px-4" on:click={toggleSidebar}>X</button>
			<SidebarItem text={'Home'} href={'/'} />
			<SidebarItem text={'Log in'} href={'/login'} />
			<SidebarItem text={'Link1'} href={'/a'} />
			<SidebarItem text={'Link1'} href={'/b'} />
			<SidebarItem text={'Link1'} href={'/c'} />
			<SidebarItem text={'Link1'} href={'/d'} />
		</div>
	</nav>
</div>
