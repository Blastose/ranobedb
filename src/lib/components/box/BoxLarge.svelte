<script lang="ts">
	export let name: string;
	export let href: string;
</script>

<div class="box-container">
	<a {href}>
		<p class="px-3 py-2 font-semibold">{name}</p>
	</a>
</div>

<style>
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
