<script lang="ts">
	import RanobeDb from '$lib/components/layout/RanobeDB.svelte';
	import { page } from '$app/stores';
	import SidebarListItem from './SidebarListItem.svelte';
	import SidebarSection from './SidebarSection.svelte';
	import type { User } from 'lucia';
	import SidebarFormButton from './SidebarFormButton.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { getSidebarStoreContext } from '$lib/stores/sidebarStore';
	import Hr from '../Hr.svelte';

	export let user: User | null;
	export let isDrawer: boolean = false;
	export let handleNavigation: (() => void) | undefined = undefined;

	function watchNavigation(node: HTMLElement) {
		function handleAClick(e: Event) {
			if (!handleNavigation) {
				return;
			}
			let target = e.target;
			if (!target || !(target instanceof Element)) {
				return;
			}

			let a = target.closest('a');
			if (!a || !node.contains(a)) {
				return;
			}

			handleNavigation();
		}

		node.addEventListener('click', handleAClick);

		return {
			destroy() {
				node.removeEventListener('click', handleAClick);
			},
		};
	}

	const sidebarStore = getSidebarStoreContext();
	function closeSidebar() {
		sidebarStore.set('closed');
	}
</script>

<aside use:watchNavigation class="sidebar thin-scrollbar" class:drawer={isDrawer}>
	<div class="flex justify-between items-center">
		<RanobeDb {user} hideTextWhenWidthSmall={false} />
		{#if !isDrawer}
			<button
				class="relative btn left-2 rounded-full inline-flex items-center justify-center w-8 h-8"
				type="button"
				aria-label="Close sidebar"
				on:click={closeSidebar}><Icon name="close" /></button
			>
		{/if}
	</div>

	<nav class="flex flex-col gap-4">
		<SidebarSection>
			<SidebarListItem active={$page.url.pathname === '/'} href="/" text="Home" icon="home" />
		</SidebarSection>

		{#if user}
			<SidebarSection sectionHeading={user.username}>
				<SidebarListItem
					active={$page.url.pathname.startsWith(`/user/${user.id_numeric}/list`)}
					href="/user/{user.id_numeric}/list"
					text="My List"
					icon="mylist"
				/>
				<SidebarListItem
					active={$page.url.pathname === `/user/${user.id_numeric}`}
					href="/user/{user.id_numeric}"
					text="Profile"
					icon="profile"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/settings'}
					href="/settings"
					text="Settings"
					icon="settings"
				/>
				<SidebarFormButton text="Sign out" textLoading="Signing out..." action="/logout">
					<Icon name="logout" />
				</SidebarFormButton>
			</SidebarSection>
		{:else}
			<SidebarSection sectionHeading="User">
				<SidebarListItem
					active={$page.url.pathname === '/login'}
					href="/login"
					text="Log in"
					icon="login"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/signup'}
					href="/signup"
					text="Sign up"
					icon="signup"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/settings'}
					href="/settings"
					text="Settings"
					icon="settings"
				/>
			</SidebarSection>
		{/if}

		<SidebarSection sectionHeading="Database">
			<SidebarListItem
				active={$page.url.pathname === '/books'}
				href="/books"
				text="Books"
				icon="books"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/series'}
				href="/series"
				text="Series"
				icon="series"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/releases'}
				href="/releases"
				text="Releases"
				icon="releases"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/staff'}
				href="/staff"
				text="Staff"
				icon="people"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/publishers'}
				href="/publishers"
				text="Publishers"
				icon="publishers"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/users'}
				href="/users"
				text="Users"
				icon="profile"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/history'}
				href="/history"
				text="Recent changes"
				icon="history"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/add'}
				href="/add"
				text="Add to database"
				icon="add"
			/>
		</SidebarSection>

		<Hr />
	</nav>
</aside>

<style>
	.sidebar {
		view-transition-name: sidebar;
		padding: 1rem 0.75rem;
		position: sticky;
		top: 0;
		width: 100%;
		height: 100dvh;
		overflow-y: auto;
		background-color: var(--bg-light1);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.sidebar.drawer {
		view-transition-name: drawer;
	}

	:global(.dark) .sidebar {
		background-color: var(--bg-dark1);
	}
</style>
