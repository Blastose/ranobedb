<script lang="ts">
	import { fade } from 'svelte/transition';
	import SidebarItem from './SidebarItem.svelte';
	import { sidebarOpen } from '$lib/sidebarStore';
	import { windowWidth } from '$lib/windowWidthStore';
	import { onMount } from 'svelte';

	let toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};

	$: if ($windowWidth <= 1000) {
		sidebarOpen.set(false);
	}

	onMount(() => {
		if ($windowWidth > 1000) {
			sidebarOpen.set(true);
		}
	});
</script>

<div
	class="duration-150 ease-in-out     
	{$windowWidth <= 1000 ? 'fixed z-10 flex' : ''}
	{$windowWidth <= 1000 && $sidebarOpen ? 'w-full' : ''}
	{$sidebarOpen ? '' : '-ml-64'}"
>
	{#if $sidebarOpen && $windowWidth <= 1000}
		<div
			transition:fade={{ duration: 150 }}
			on:click={toggleSidebar}
			class="w-[200%] h-screen bg-gray-700 opacity-50 fixed"
		/>
	{/if}
	<nav
		class="overflow-y-scroll overflow-x-auto h-screen w-64 sticky top-0 bg-[#e4e7ee] drop-shadow-sm
    "
	>
		<div class="px-4 flex flex-col">
			<button
				class="hover:bg-[#cdcedd] self-end px-4"
				tabindex={$sidebarOpen ? 0 : -1}
				on:click={toggleSidebar}>X</button
			>
			<SidebarItem text={'Home'} href={'/'} />
			<SidebarItem text={'Log in'} href={'/login'} />
			<SidebarItem text={'Sign up'} href={'/signup'} />
			<SidebarItem text={'Books'} href={'/books'} />
			<SidebarItem text={'Link1'} href={'/c'} />
			<SidebarItem text={'Link1'} href={'/d'} />
		</div>
	</nav>
</div>
