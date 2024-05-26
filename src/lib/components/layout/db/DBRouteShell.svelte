<script lang="ts">
	import type { Theme } from '$lib/stores/themeStore';

	export let bgImageStyle: string | null;
	export let theme: Theme;

	function defaultBackgroundImage(theme: Theme) {
		if (theme === 'dark') {
			return `background-image: linear-gradient(var(--grad-dark) 0%, var(--grad-dark) 10%, var(--bg-dark) 90%, var(--bg-dark) 100%);`;
		} else {
			return `background-image: linear-gradient(var(--grad-light) 0%, var(--bg-light) 60%, var(--bg-light) 100%);`;
		}
	}

	$: bgStyle = bgImageStyle ?? defaultBackgroundImage(theme);
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div
		class="banner-img h-[256px]"
		style={bgStyle}
		style:--grad-dark="rgba(115, 115, 156, 1)"
		style:--grad-light="#b4afc7"
	>
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
