<script lang="ts">
	import { page } from '$app/stores';
	import Header from './Header.svelte';
	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import type { User } from 'lucia';
	import Fly from './Fly.svelte';

	export let user: User | undefined;
</script>

<div class="layout-container">
	<div class="sidebar-wrapper sidebar-animation">
		<Sidebar {user} />
	</div>

	<div class="layout-items-wrapper">
		<Header {user} />

		<div class="main-wrapper">
			<Fly key={$page.url.pathname}>
				<slot />
			</Fly>
		</div>
	</div>
</div>

<style>
	.layout-container {
		display: grid;
		grid-template-columns: min-content 1fr;
		min-height: 100%;
	}

	.layout-items-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.main-wrapper {
		flex-grow: 1;
		overflow-x: clip;
	}

	.sidebar-wrapper {
		width: 16rem;
		margin-left: -16rem;
		visibility: hidden;
	}

	.sidebar-animation {
		transition-duration: 0.45s;
		transition-timing-function: cubic-bezier(0.17, 0.67, 0.23, 1.02);
	}

	@media (min-width: 1024px) {
		.sidebar-wrapper {
			margin-left: 0px;
			visibility: visible;
		}
	}
</style>
