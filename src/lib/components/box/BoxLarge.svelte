<script lang="ts">
	export let name: string;
	export let href: string;
</script>

<div class="box-container">
	<a class="link-text" {href}>
		<p class="text">{name}</p>
	</a>
</div>

<style>
	.link-text {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0.5rem 0.75rem;
	}

	.text {
		overflow: hidden;
		font-weight: 600;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	.box-container {
		transition-duration: 75ms;
		background-color: var(--primary-200);
		border-radius: 0.125rem;
	}

	.box-container:hover {
		background-color: var(--primary-400);
	}

	:global(.dark) .box-container {
		background-color: var(--dark-200);
	}

	:global(.dark) .box-container:hover {
		background-color: var(--dark-400);
	}
</style>
