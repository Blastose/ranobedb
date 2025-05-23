<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	export let genre: { id: number; name?: string | null; mode?: 'incl' | 'excl' | 'none' };
	export let removable: boolean;
	export let handleRemove: (() => void) | undefined = undefined;
	export let handleUpdate: (() => void) | undefined = undefined;

	function toggle() {
		if (!removable) {
			if (genre.mode === 'none') {
				genre.mode = 'incl';
			} else if (genre.mode === 'incl') {
				genre.mode = 'excl';
			} else if (genre.mode === 'excl') {
				genre.mode = 'none';
			}
		} else {
			if (genre.mode === 'none') {
				genre.mode = 'incl';
			} else if (genre.mode === 'incl') {
				genre.mode = 'excl';
			} else if (genre.mode === 'excl') {
				genre.mode = 'incl';
			}
		}
		if (handleUpdate) {
			handleUpdate();
		}
	}
</script>

<div
	class="tag
{genre.mode === 'none' ? '' : ''}
{genre.mode === 'incl' ? 'incl' : ''}
{genre.mode === 'excl' ? 'excl' : ''}"
>
	<button
		type="button"
		on:click={toggle}
		class="capitalize rounded-3xl pl-2 {removable ? 'pr-8' : 'pr-2'} 
		text-sm font-semibold"
	>
		{genre.name}
	</button>
	{#if removable}
		<button
			on:click={handleRemove}
			type="button"
			aria-label="remove tag"
			class="absolute right-1 rounded-full"
			><Icon name="close" height="20" width="20"></Icon></button
		>
	{/if}
</div>

<style>
	.tag {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition-duration: 300ms;
		position: relative;
		background-color: var(--primary-200);
		border-radius: 1.5rem;
		border-width: 1px;
		border-color: transparent;
	}

	:global(.dark) .tag {
		background-color: var(--dark-500);
	}

	.tag.incl {
		background-color: rgba(13, 110, 50, 0.623);
		border-color: rgb(74 222 128);
		color: var(--text-dark);
		border-style: solid;
	}

	:global(.dark) .tag.incl {
		background-color: rgb(22 101 52 / 0.5);
	}

	.tag.excl {
		background-color: rgba(185, 28, 28, 0.719);
		border-color: rgb(255, 209, 209);
		color: var(--text-dark);
		border-style: dashed;
	}

	:global(.dark) .tag.excl {
		background-color: rgba(185, 28, 28, 0.719);
	}
</style>
