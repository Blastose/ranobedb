<script lang="ts">
	import SidebarItem from '$lib/sidebar/SidebarItem.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { clickOutside } from '$lib/clickOutside';
	import { profileMenuOpen } from '$lib/stores/profileMenuStore';
	import { session } from '$app/stores';

	export let toggleButton: Node | null = null;

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error: any) {
			console.error(error);
		}
	};

	const hideProfileMenu = () => {
		$profileMenuOpen = false;
	};
</script>

<ul
	class="absolute left-auto right-0 w-60 rounded-md px-2 py-2 mt-2 drop-shadow-md outline outline-[#dddfe7] outline-1 bg-[#e4e7ee]"
	use:clickOutside={toggleButton}
	on:outclick={() => ($profileMenuOpen = false)}
>
	{#if $session.user}
		<li class="text-center py-2">
			<a href="/profile">
				<span class="font-bold text-lg">{$session.user.email}</span>
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
