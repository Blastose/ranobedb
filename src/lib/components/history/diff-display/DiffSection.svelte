<script lang="ts">
	import type { Diff } from '../utils';

	export let changes: Diff;
	export let type: 'old' | 'new';
</script>

<div>
	{#each changes.changes as part}
		{@const showDiffBg = type === 'new' ? part.added : part.removed}
		{@const doNotShowChange = type === 'new' ? part.removed : part.added}

		{#if doNotShowChange}
			<!-- Don't show the change -->
		{:else if changes.type === 'line'}
			{#each part.value.split('\n') as par}
				{#if changes.textType === 'html'}
					<p
						class="w-fit {showDiffBg
							? type === 'new'
								? 'text-diff-added'
								: 'text-diff-removed'
							: ''}"
					>
						{@html par}
					</p>
				{:else}
					<p
						class="w-fit {showDiffBg
							? type === 'new'
								? 'text-diff-added'
								: 'text-diff-removed'
							: ''}"
					>
						{par}
					</p>
				{/if}
			{/each}
		{:else}
			<span class={showDiffBg ? (type === 'new' ? 'text-diff-added' : 'text-diff-removed') : ''}
				>{part.value}</span
			>
		{/if}
	{/each}
</div>

<style>
	.text-diff-removed {
		background-color: rgba(255, 66, 66, 0.295);
	}

	.text-diff-added {
		background-color: rgba(55, 224, 55, 0.295);
	}
</style>
