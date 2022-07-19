<script lang="ts">
	import { fade } from 'svelte/transition';
	import SidebarItem from './SidebarItem.svelte';
	import SidebarHeading from './SidebarHeading.svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import { windowWidth } from '$lib/stores/windowWidthStore';
	import { onMount } from 'svelte';
	import { reader } from '$lib/stores/readerStore';
	import { session } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};

	const hideSidebar = () => {
		if ($windowWidth <= 1000) {
			sidebarOpen.set(false);
		}
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
				on:click={toggleSidebar}
			>
				<Icon name="close" width="24" height="24" />
			</button>

			<SidebarHeading text={'Home'} href={'/'} onClickFunction={hideSidebar}>
				<Icon name="home" width="24" height="24" />
			</SidebarHeading>

			<div>
				<SidebarHeading text={$reader ? $reader.reader_name : 'User'} onClickFunction={hideSidebar}>
					<Icon name="profile" width="24" height="24" />
				</SidebarHeading>
				{#if $session.user}
					<SidebarItem text={'My List'} href={'/my-list'} onClickFunction={hideSidebar} />
					<SidebarItem text={'My Profile'} href={'/profile'} onClickFunction={hideSidebar} />
					<SidebarItem text={'Sign out'} href={'/api/auth/logout'} />
				{:else}
					<SidebarItem text={'Log in'} href={'/login'} onClickFunction={hideSidebar} />
					<SidebarItem text={'Sign up'} href={'/signup'} onClickFunction={hideSidebar} />
				{/if}
			</div>

			<div>
				<SidebarHeading text="Database" onClickFunction={hideSidebar}>
					<Icon name="database" width="24" height="24" />
				</SidebarHeading>
				<SidebarItem text={'Books'} href={'/books'} onClickFunction={hideSidebar} />
				<SidebarItem text={'Series'} href={'/series'} onClickFunction={hideSidebar} />
				<SidebarItem text={'People'} href={'/people'} onClickFunction={hideSidebar} />
				<SidebarItem text={'Publishers'} href={'/publishers'} onClickFunction={hideSidebar} />
			</div>
		</div>
	</nav>
</div>
