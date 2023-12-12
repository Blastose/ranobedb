<script lang="ts">
	export let imageBgStyle: string | null;

	$: asdf =
		imageBgStyle ??
		`background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%);`;
</script>

<main class="container-rndb -mt-32 flex flex-col gap-4">
	<div class="banner-img h-[256px]" style={asdf}>
		<div class="blur-image" />
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
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
