<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	export let backgroundCover: string | null;
</script>

<main class="layout-container">
	<div
		class="highlight bg"
		class:bg-image={backgroundCover}
		style={backgroundCover
			? `background-image: linear-gradient(rgba(27, 27, 27, 0.4), rgba(33, 34, 36, 0.9)), url(${PUBLIC_IMAGE_URL}/${backgroundCover}.jpg);`
			: ''}
	>
		<div class="blur-image">
			<div class="main-container mt-4">
				<slot name="top" />
			</div>
		</div>
	</div>

	<div class="main-container content">
		<slot name="content" />
	</div>
</main>

<style>
	.layout-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: min-content 1fr;
	}

	.bg {
		min-height: 10rem;
	}

	.bg-image {
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: white;
	}

	.highlight:not(.bg-image) {
		background: linear-gradient(var(--primary-500), #2b2c3d);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
