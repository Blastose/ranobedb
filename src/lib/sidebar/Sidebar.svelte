<script lang="ts">
	import { fade } from 'svelte/transition';
	import SidebarItem from './SidebarItem.svelte';
	import SidebarHeading from './SidebarHeading.svelte';
	import { sidebarOpen } from '$lib/sidebarStore';
	import { windowWidth } from '$lib/windowWidthStore';
	import { onMount } from 'svelte';
	import ProfileIcon from '$lib/svg/ProfileIcon.svelte';
	import DatabaseIcon from '$lib/svg/DatabaseIcon.svelte';
	import HomeIcon from '$lib/svg/HomeIcon.svelte';
	import CloseIcon from '$lib/svg/CloseIcon.svelte';
	import { reader } from '$lib/readerStore';

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
		<div class="px-4 py-2 flex flex-col gap-2">
			<button
				class="hover:bg-[#cdcedd] self-end rounded-lg p-1 duration-75"
				tabindex={$sidebarOpen ? 0 : -1}
				on:click={toggleSidebar}><CloseIcon /></button
			>

			<SidebarHeading text={'Home'} href={'/'}>
				<HomeIcon />
			</SidebarHeading>

			<div>
				<SidebarHeading text={$reader ? $reader.reader_name : 'User'}>
					<ProfileIcon />
				</SidebarHeading>
				{#if $reader}
					<SidebarItem text={'My List'} href={'/my-list'} />
					<SidebarItem text={'My Profile'} href={'/profile'} />
				{:else}
					<SidebarItem text={'Log in'} href={'/login'} />
					<SidebarItem text={'Sign up'} href={'/signup'} />
				{/if}
			</div>

			<div>
				<SidebarHeading text="Database">
					<DatabaseIcon />
				</SidebarHeading>
				<SidebarItem text={'Books'} href={'/books'} />
				<SidebarItem text={'Series'} href={'/series'} />
				<SidebarItem text={'People'} href={'/people'} />
				<SidebarItem text={'Publishers'} href={'/publishers'} />
			</div>
		</div>
	</nav>
</div>
