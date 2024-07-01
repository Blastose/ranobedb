<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';
	import BottomNavButton from './BottomNavButton.svelte';
</script>

<aside class="bottom-nav">
	<nav class="h-full">
		<ul class="nav-items">
			<li>
				<BottomNavButton href="/" text="Home" active={$page.url.pathname === '/'}>
					<Icon name="home" />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/database"
					text="Database"
					active={$page.url.pathname === '/database'}
				>
					<Icon name="database" />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/advanced-search"
					text="Search"
					active={$page.url.pathname === '/advanced-search'}
				>
					<Icon name="search" />
				</BottomNavButton>
			</li>
			<li>
				<BottomNavButton
					href="/settings"
					text="Settings"
					active={$page.url.pathname === '/settings'}
				>
					<Icon name="settings" />
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
		background-color: var(--bg-light1);
		z-index: 9999;
	}

	:global(.dark) .bottom-nav {
		background-color: var(--bg-dark1);
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
