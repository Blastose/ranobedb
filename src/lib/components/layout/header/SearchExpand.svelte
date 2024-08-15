<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let ariaLabel: string;
</script>

<!-- TODO -->
<div class="search-input-container">
	<input
		name="q"
		type="text"
		class="input search-input"
		value={$page.url.searchParams.get('q')}
		aria-label={ariaLabel}
	/>
	<div class="search-icon pointer-events-none">
		<Icon name="search" />
	</div>
</div>

<style>
	.search-input-container {
		position: relative;
		max-width: 36rem;
	}

	.search-input {
		width: 100%;
		max-width: 1px;
		transition-duration: 300ms;
	}

	.search-input:focus {
		max-width: 100%;
		padding-left: 2.5rem !important;
	}

	.search-icon {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
</style>
