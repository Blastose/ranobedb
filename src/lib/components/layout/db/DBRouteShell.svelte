<script lang="ts">
	import type { Theme } from '$lib/stores/themeStore';

	export let imageBgStyle: string | null;
	export let theme: Theme;

	function defaultBackgroundImage(color: string, theme: Theme) {
		if (theme === 'dark') {
			return `background-image: linear-gradient(${color} 0%, ${color} 10%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%);`;
		} else {
			return `background-image: linear-gradient(${color} 0%, ${color} 0%, rgba(242, 242, 242, 1) 66%, rgba(242, 242, 242, 1) 100%);`;
		}
	}

	$: bgStyle = imageBgStyle ?? defaultBackgroundImage('rgba(115, 115, 156, 1)', theme);
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div class="banner-img h-[256px]" style={bgStyle}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10">
		<slot />
	</div>
</main>

<style>
	.banner-img {
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(8px);
	}
</style>
