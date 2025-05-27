<script lang="ts">
	interface Props {
		badges: string[];
		location?: 'top-right' | 'bottom-right';
	}

	let { badges, location = 'top-right' }: Props = $props();
</script>

<div
	class="absolute flex flex-col gap-1 p-1 sm:p-2 items-end {location === 'top-right'
		? 'top-0 right-0'
		: 'bottom-0 right-0'}"
>
	{#each badges as badge}
		{#if badge !== ''}
			<div class="bg-black/90 dark-main-text w-fit text-sm sm:text-base rounded-full px-2">
				<p>{badge}</p>
			</div>
		{/if}
	{/each}
</div>
