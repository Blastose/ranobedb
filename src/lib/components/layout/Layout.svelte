<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Drawer from '$lib/components/drawer/Drawer.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import Modal from '$lib/components/modal/Modal.svelte';
	import sidebar from '$lib/stores/sidebar';
	import drawer from '$lib/stores/drawer';
	import largeScreen from '$lib/stores/largeScreen';
	import modalBook from '$lib/stores/modalBook';
	import Fly from '$lib/components/layout/Fly.svelte';
	import type { User } from 'lucia';

	export let pathname: string;
	export let user: User | undefined;
</script>

<Toast />
{#if $modalBook}
	<Modal />
{/if}
<Drawer />

<div class="main">
	<div
		class="sidebar
		{$sidebar ? '' : 'hide-sidebar'}
		{$drawer ? 'show-drawer' : ''}"
	>
		<Sidebar {user} tabindex={($sidebar && $largeScreen) || $drawer} />
	</div>
	<div class="filler" />
	<div class="header">
		<Header {user} />
	</div>
	<div class="content">
		<Fly key={pathname}>
			<slot />
		</Fly>
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
		transition-duration: 450ms;
		transition-timing-function: cubic-bezier(0.17, 0.67, 0.23, 1.02);
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
		overflow: hidden;
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
