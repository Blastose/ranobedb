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
	<div class="{$sidebar ? '' : '-ml-64'} duration-150 ease-in-out sidebar">
		<Sidebar />
	</div>
	<div class="h-screen filler lg:hidden" />
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
			'filler header'
			'filler content';
		grid-template-rows: min-content 1fr;
		grid-template-columns: 0px 1fr;
	}

	.sidebar {
		display: none;
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

	.filler {
		grid-area: filler;
	}

	@media (min-width: 1024px) {
		.main {
			height: 100%;
			grid-template-areas:
				'sidebar header'
				'sidebar content';
			grid-template-columns: min-content 1fr;
		}

		.sidebar {
			display: block;
		}
	}
</style>
