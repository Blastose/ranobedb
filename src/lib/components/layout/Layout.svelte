<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Drawer from '$lib/components/drawer/Drawer.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import Modal from '$lib/components/modal/Modal.svelte';
	import sidebar from '$lib/stores/sidebar';
	import drawer from '$lib/stores/drawer';
	import largeScreen from '$lib/stores/largeScreen';
</script>

<Toast />
<Modal />
<Drawer />

<div class="main">
	<div
		class="sidebar duration-150 ease-in-out
		{$sidebar ? '' : 'hide-sidebar'}
		{$drawer ? 'show-drawer' : ''}"
	>
		<Sidebar tabindex={($sidebar && $largeScreen) || $drawer} />
	</div>
	<div class="filler" />
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
			'filler sidebar header'
			'filler sidebar content';
		grid-template-rows: min-content 1fr;
		grid-template-columns: 0px min-content 1fr;
	}

	.filler {
		grid-area: filler;
		height: 100vh;
	}

	.sidebar {
		grid-area: sidebar;
		margin-left: -16rem;
	}

	.header {
		grid-area: header;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.content {
		grid-area: content;
		padding-bottom: 20px;
		background-color: var(--primary-50);
	}

	:global(.dark) .content {
		background-color: var(--dark-700);
	}

	@media (min-width: 1024px) {
		.sidebar {
			margin-left: 0;
		}
	}

	.hide-sidebar {
		margin-left: -16rem;
	}

	.show-drawer {
		margin-left: 0;
	}
</style>
