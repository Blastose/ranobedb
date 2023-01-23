<script lang="ts">
	export let items: { id: number; name: string }[];
	export let onClick: (item: { id: number; name: string }) => void;
</script>

{#if items.length > 0}
	<div class="dropdown-container">
		{#each items as item}
			<button
				type="button"
				on:click={() => {
					onClick({ id: item.id, name: item.name });
				}}
				class="dropdown-item"
			>
				{item.name}
			</button>
		{/each}
	</div>
{/if}

<style>
	.dropdown-container {
		background-color: var(--primary-200);
		padding: 0.5rem;
		max-height: 12rem;
		width: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	:global(.dark) .dropdown-container {
		background-color: var(--dark-200);
	}

	.dropdown-item {
		text-align: left;
		padding: 0.375rem 0.5rem;
		transition-duration: 150ms;
	}

	.dropdown-item:hover:not(.selected) {
		background-color: var(--primary-400);
	}

	:global(.dark) .dropdown-item:hover:not(.selected) {
		background-color: var(--dark-400);
	}
</style>
