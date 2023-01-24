<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import sidebar from '$lib/stores/sidebar';
	import drawer from '$lib/stores/drawer';

	export let tabindex: boolean;

	const closeSidebar = () => {
		if (window.matchMedia('(min-width: 1024px)').matches) {
			sidebar.set(false);
		} else {
			drawer.set(false);
		}
	};

	let btn: HTMLButtonElement;
	export const focus = () => {
		btn.focus();
	};
</script>

<button
	class="btn rounded-lg p-1"
	aria-label="close sidebar"
	type="button"
	on:click={closeSidebar}
	tabindex={tabindex ? 0 : -1}
	bind:this={btn}
>
	<Icon height="24" width="24" name="close" />
</button>
