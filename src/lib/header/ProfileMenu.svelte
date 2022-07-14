<script lang="ts">
	import { reader } from '$lib/readerStore';
	import SidebarItem from '$lib/sidebar/SidebarItem.svelte';
	import SidebarButton from '$lib/sidebar/SidebarButton.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { clickOutside } from '$lib/clickOutside';
	import { profileMenuOpen } from '$lib/profileMenuStore';

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
	class="absolute left-auto right-0 w-48 rounded-md mt-1 bg-[#e4e7ee]"
	use:clickOutside={toggleButton}
	on:outclick={() => ($profileMenuOpen = false)}
>
	{#if $reader}
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
		<SidebarButton
			text={'Sign out'}
			onClickFunction={() => {
				signOut();
				hideProfileMenu();
			}}
		/>
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
