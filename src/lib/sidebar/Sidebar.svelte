<script lang="ts">
	import { fade } from 'svelte/transition';
	import SidebarItem from './SidebarItem.svelte';
	import SidebarHeading from './SidebarHeading.svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import { windowWidth } from '$lib/stores/windowWidthStore';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};

	const hideSidebar = () => {
		if ($windowWidth < 1024) {
			sidebarOpen.set(false);
		}
	};

	let initialLoad = true;

	onMount(() => {
		hideSidebar();
		initialLoad = false;
	});
</script>

<svelte:window
	bind:innerWidth={$windowWidth}
	on:resize={() => {
		hideSidebar();
	}}
/>

<div
	class="duration-150 ease-in-out
	fixed z-50 flex lg:static lg:z-auto lg:block
	{initialLoad ? '-ml-64 lg:ml-0' : ''}
	{$sidebarOpen ? '' : '-ml-64'}"
>
	{#if $sidebarOpen && $windowWidth < 1024 && !initialLoad}
		<div
			transition:fade={{ duration: 150 }}
			on:click={toggleSidebar}
			class="w-[200%] h-screen bg-black/[.66] fixed"
		/>
	{/if}
	<nav
		class="overflow-x-auto h-screen w-64 sticky top-0 bg-[#e4e7ee] dark:bg-dark-600 drop-shadow-sm"
	>
		<div class="px-4 py-2 flex flex-col gap-2 dark:text-white">
			<button
				class="hover:bg-[#cdcedd] dark:hover:text-black self-end rounded-lg p-1 duration-75"
				tabindex={$sidebarOpen ? 0 : -1}
				on:click={toggleSidebar}
			>
				<Icon name="close" width="24" height="24" />
			</button>

			<SidebarHeading text={'Home'} href={'/'} onClickFunction={hideSidebar}>
				<Icon name="home" width="24" height="24" />
			</SidebarHeading>

			<div>
				<SidebarHeading
					text={$session.user ? $session.user.user_metadata.username : 'User'}
					onClickFunction={hideSidebar}
				>
					<Icon name="profile" width="24" height="24" />
				</SidebarHeading>
				{#if $session.user}
					<SidebarItem
						text={'My List'}
						href={'/my-list'}
						prefetch={true}
						onClickFunction={hideSidebar}
					/>
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
				<SidebarItem text={'Books'} href={'/books'} prefetch={true} onClickFunction={hideSidebar} />
				<SidebarItem text={'Series'} href={'/series'} onClickFunction={hideSidebar} />
				<SidebarItem text={'People'} href={'/people'} onClickFunction={hideSidebar} />
				<SidebarItem text={'Publishers'} href={'/publishers'} onClickFunction={hideSidebar} />
			</div>
		</div>
	</nav>
</div>
