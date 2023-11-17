<script lang="ts">
	import { page } from '$app/stores';
	import { IconDatabase, IconHome, IconSearch, IconSettings } from '@tabler/icons-svelte';
	import BottomNavButton from './BottomNavButton.svelte';
</script>

<aside class="bottom-nav">
	<nav class="h-full">
		<ul class="nav-items">
			<li>
				<BottomNavButton href="/" text="Home" active={$page.url.pathname === '/'}>
					<IconHome />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/database"
					text="Database"
					active={$page.url.pathname === '/database'}
				>
					<IconDatabase />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/advanced-search"
					text="Search"
					active={$page.url.pathname === '/advanced-search'}
				>
					<IconSearch />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/settings"
					text="Settings"
					active={$page.url.pathname === '/settings'}
				>
					<IconSettings />
				</BottomNavButton>
			</li>
		</ul>
	</nav>
</aside>

<style>
	.bottom-nav {
		position: sticky;
		bottom: 0;
		display: block;
		height: 3.5rem;
		view-transition-name: bottom-nav;
		background-color: rgb(231, 230, 236);
	}

	:global(.dark) .bottom-nav {
		background-color: rgb(48, 48, 51);
	}

	.nav-items {
		height: 100%;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 2rem;
	}

	@media (min-width: 1024px) {
		.bottom-nav {
			display: none;
		}
	}
</style>
