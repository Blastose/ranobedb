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

	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';

	export let pathname: string;

	beforeNavigate((beforeNavigate) => {
		if (beforeNavigate.delta && beforeNavigate.delta < 0) {
			flyDirection = -1;
		} else {
			flyDirection = 1;
		} 
	});

	let flyDirection = 1;
	$: flyXOffset = $largeScreen ? 20 : 12;
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
		<Sidebar tabindex={($sidebar && $largeScreen) || $drawer} />
	</div>
	<div class="filler" />
	<div class="header">
		<Header />
	</div>
	<div class="content">
		{#key pathname}
			<div in:fly={{ x: flyXOffset * flyDirection, duration: 250, easing: cubicOut }}>
				<slot />
			</div>
		{/key}
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
		transition-duration: 150ms;
		transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
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
