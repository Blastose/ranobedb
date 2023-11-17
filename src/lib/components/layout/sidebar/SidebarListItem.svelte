<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import {
		IconHome,
		IconLogout,
		IconUser,
		IconNotebook,
		IconBook,
		IconBooks,
		IconNotes,
		IconFriends,
		IconBuilding,
		IconPlus,
		IconLogin,
		IconUserPlus
	} from '@tabler/icons-svelte';

	export let active: boolean;
	export let href: string;
	export let text: string;
	export let icon:
		| 'home'
		| 'logout'
		| 'profile'
		| 'mylist'
		| 'books'
		| 'series'
		| 'releases'
		| 'people'
		| 'publishers'
		| 'add'
		| 'login'
		| 'signup';
</script>

<li>
	<SidebarItem {active} {href} {text}>
		{#if icon === 'home'}
			<IconHome />
		{:else if icon === 'logout'}
			<IconLogout />
		{:else if icon === 'profile'}
			<IconUser />
		{:else if icon === 'mylist'}
			<IconNotebook />
		{:else if icon === 'books'}
			<IconBook />
		{:else if icon === 'series'}
			<IconBooks />
		{:else if icon === 'releases'}
			<IconNotes />
		{:else if icon === 'people'}
			<IconFriends />
		{:else if icon === 'publishers'}
			<IconBuilding />
		{:else if icon === 'add'}
			<IconPlus />
		{:else if icon === 'login'}
			<IconLogin />
		{:else if icon === 'signup'}
			<IconUserPlus />
		{/if}
	</SidebarItem>
</li>
