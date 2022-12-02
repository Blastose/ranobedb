<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	export let person: { name: string; id: number };
	export let type: string;
</script>

<div class="box-container">
	<a href="/person/{person.id}">
		<div class="content text-xs">
			{#if type === 'artist'}
				<span><Icon height="16" width="16" name="palette" /></span>
			{:else if type === 'author'}
				<span><Icon height="16" width="16" name="pencil" /></span>
			{/if}
			<span>{person.name}</span>
		</div>
	</a>
</div>

<style>
	.box-container {
		transition-duration: 75ms;
		background-color: #cfd7e7;
		border-radius: 0.125rem;
	}

	.box-container:hover {
		background-color: #697596;
		color: white;
	}

	:global(.dark) .box-container {
		background-color: var(--dark-200);
	}

	:global(.dark) .box-container:hover {
		background-color: var(--dark-400);
	}

	.content {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		font: bold;
	}
</style>
