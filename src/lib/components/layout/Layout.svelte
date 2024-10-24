<script lang="ts">
	import Header from './header/Header.svelte';
	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import type { User } from '$lib/server/lucia/lucia';
	import Fly from './Fly.svelte';
	import Toaster from '$lib/components/toast/Toaster.svelte';
	import { getSidebarStoreContext } from '$lib/stores/sidebarStore';

	export let user: User | null;
	export let url: string;

	const sidebarStore = getSidebarStoreContext();
</script>

<Toaster />

<div class="layout-container">
	<div class="sidebar-wrapper sidebar-animation" class:sidebar-open={$sidebarStore === 'open'}>
		<Sidebar {user} />
	</div>

	<div class="layout-items-wrapper">
		<Header {user} />

		<div class="main-wrapper">
			<Fly key={url}>
				<slot />
			</Fly>
		</div>
	</div>
</div>

<style>
	.layout-container {
		display: grid;
		grid-template-columns: min-content 1fr;
	}

	.layout-items-wrapper {
		display: flex;
		flex-direction: column;
	}

	.main-wrapper {
		flex-grow: 1;
		overflow-x: clip;
		container: main / inline-size;
	}

	.sidebar-wrapper {
		width: 240px;
		margin-left: -240px;
		visibility: hidden;
	}

	.sidebar-animation {
		transition-duration: 0.45s;
		transition-timing-function: cubic-bezier(0.17, 0.67, 0.23, 1.02);
	}

	@media (min-width: 1024px) {
		.sidebar-wrapper.sidebar-open {
			margin-left: 0px;
			visibility: visible;
		}
	}
</style>
