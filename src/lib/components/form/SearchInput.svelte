<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let ariaLabel: string;
	export let inputPlaceholder: string;
</script>

<div class="search-input-container">
	<input
		name="q"
		type="text"
		class="input search-input"
		style="padding-left: 2.5rem !important;"
		value={page.url.searchParams.get('q')}
		placeholder={inputPlaceholder}
		aria-label={ariaLabel}
	/>
	<div class="search-icon">
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
	}

	.search-icon {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
</style>
