<script lang="ts">
	import SidebarItem from '$lib/sidebar/SidebarItem.svelte';
	import { clickOutside } from '$lib/clickOutside';
	import { profileMenuOpen } from '$lib/stores/profileMenuStore';
	import { session } from '$app/stores';

	export let toggleButton: Node | null = null;

	const hideProfileMenu = () => {
		$profileMenuOpen = false;
	};
</script>

<ul
	class="absolute left-auto right-0 min-w-[15rem] rounded-md px-2 py-2 mt-2 drop-shadow-md outline outline-[#e4e7ee] dark:outline-[#3f4142] outline-1 bg-[#e4e7ee] dark:bg-dark-300"
	use:clickOutside={toggleButton}
	on:outclick={() => ($profileMenuOpen = false)}
>
	{#if $session.user}
		<li class="text-center py-2">
			<a href="/profile">
				<span class="font-bold text-lg dark:text-white">{$session.user.user_metadata.username}</span
				>
			</a>
		</li>
		<SidebarItem
			text={'My List'}
			href={'/my-list'}
			highlight={false}
			onClickFunction={hideProfileMenu}
		/>
		<SidebarItem
			text={'My Profile'}
			href={'/profile'}
			highlight={false}
			onClickFunction={hideProfileMenu}
		/>
		<SidebarItem text={'Sign out'} href={'/api/auth/logout'} />
	{:else}
		<SidebarItem
			text={'Log in'}
			href={'/login'}
			highlight={false}
			onClickFunction={hideProfileMenu}
		/>
		<SidebarItem
			text={'Sign up'}
			href={'/signup'}
			highlight={false}
			onClickFunction={hideProfileMenu}
		/>
	{/if}
</ul>
