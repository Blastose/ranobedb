<script lang="ts">
	import RanobeDb from '$lib/components/layout/RanobeDB.svelte';
	import { page } from '$app/stores';
	import SidebarListItem from './SidebarListItem.svelte';
	import SidebarSection from './SidebarSection.svelte';
	import type { User } from 'lucia';

	export let user: User | undefined;
</script>

<aside class="sidebar thin-scrollbar">
	<RanobeDb hideTextWhenWidthSmall={false} />

	<nav class="flex flex-col gap-4">
		<SidebarSection>
			<SidebarListItem active={$page.url.pathname === '/'} href="/" text="Home" icon="home" />
		</SidebarSection>

		{#if user}
			<SidebarSection sectionHeading={user.username}>
				<SidebarListItem
					active={$page.url.pathname === '/my-list'}
					href="/my-list"
					text="My List"
					icon="mylist"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/profile'}
					href="/profile"
					text="Profile"
					icon="profile"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/signout'}
					href="/signout"
					text="Sign out"
					icon="logout"
				/>
			</SidebarSection>
		{:else}
			<SidebarSection sectionHeading="User">
				<SidebarListItem
					active={$page.url.pathname === '/login'}
					href="/login"
					text="Login"
					icon="login"
				/>
				<SidebarListItem
					active={$page.url.pathname === '/signup'}
					href="/signup"
					text="Sign up"
					icon="signup"
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
				active={$page.url.pathname === '/my-series'}
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
				active={$page.url.pathname === '/people'}
				href="/people"
				text="People"
				icon="people"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/publishers'}
				href="/publishers"
				text="Publishers"
				icon="publishers"
			/>
			<SidebarListItem
				active={$page.url.pathname === '/add'}
				href="/add"
				text="Add to database"
				icon="add"
			/>
		</SidebarSection>
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
		background-color: rgb(231, 230, 236);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.dark) .sidebar {
		background-color: rgb(48, 48, 51);
	}
</style>
