<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import sidebar from '$lib/stores/sidebar';
</script>

<div class="main">
	<div class="{$sidebar ? '' : '-ml-[200px]'} duration-150 ease-in-out sidebar">
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
			'header'
			'content';
		grid-template-rows: min-content 1fr;
		grid-template-columns: 1fr;
	}

	.sidebar {
		display: none;
		grid-area: sidebar;
		background-color: red;
	}

	.header {
		grid-area: header;
		background-color: blue;
	}

	.content {
		grid-area: content;
		background-color: green;
		padding-bottom: 20px;
	}

	@media (min-width: 640px) {
		.main {
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
