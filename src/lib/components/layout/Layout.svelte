<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Drawer from '$lib/components/drawer/Drawer.svelte';
	import sidebar from '$lib/stores/sidebar';
</script>

<Drawer>
	<Sidebar />
</Drawer>

<div class="main">
	<div
		class="hide-sidebar {$sidebar ? '' : 'hide-sidebar-only'}
		 duration-150 ease-in-out sidebar"
	>
		<Sidebar />
	</div>
	<div class="header">
		<Header />
	</div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.main {
		display: grid;
		height: 100%;
		grid-template-areas:
			'sidebar header'
			'sidebar content';
		grid-template-rows: min-content 1fr;
		grid-template-columns: min-content 1fr;
	}

	.sidebar {
		grid-area: sidebar;
	}

	.header {
		grid-area: header;
		position: sticky;
		top: 0;
	}

	.content {
		grid-area: content;
		padding-bottom: 20px;
		background-color: var(--primary-50);
	}

	:global(.dark) .content {
		background-color: var(--dark-700);
	}

	.hide-sidebar {
		margin-left: -16rem;
	}

	@media (min-width: 1024px) {
		.hide-sidebar {
			margin-left: 0;
		}
	}

	.hide-sidebar-only {
		margin-left: -16rem;
	}
</style>
