<script lang="ts">
	import type { Change2 } from '../utils';

	export let changes: NonNullable<Change2>;
</script>

<div class="grid grid-cols-2">
	<div>
		<p>Old</p>
		{#if changes}
			{#each changes.changes as part}
				{#if !part.added}
					{#if part.removed}
						{#if changes.type === 'line'}
							{#each part.value.split('\n') as pa}
								<!-- TODO xss -->
								<p class="w-fit bg-red-500 bg-opacity-30">{@html pa}</p>
							{/each}
						{:else}
							<span class="bg-red-500 bg-opacity-30">{part.value}</span>
						{/if}
					{:else if changes.type === 'line'}
						{#each part.value.split('\n') as pa}
							<p>{@html pa}</p>
						{/each}
					{:else}
						<span>{part.value}</span>
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
	<div>
		<p>New</p>
		{#if changes}
			{#each changes.changes as part}
				{#if !part.removed}
					{#if part.added}
						{#each part.value.split('\n') as pa}
							<!-- TODO xss -->
							<p class="w-fit bg-green-500 bg-opacity-30">{@html pa}</p>
						{/each}
					{:else}
						{#each part.value.split('\n') as pa}
							<p>{@html pa}</p>
						{/each}
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
</div>
