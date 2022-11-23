<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import sidebar from '$lib/stores/sidebar';
	import drawer from '$lib/stores/drawer';

	const closeSidebar = () => {
		if (window.matchMedia('(min-width: 1024px)').matches) {
			sidebar.set(false);
		} else {
			drawer.set(false);
		}
	};
</script>

<button class="btn rounded-lg p-1" aria-label="close sidebar" on:click={closeSidebar}>
	<Icon height="24" width="24" name="close" />
</button>
