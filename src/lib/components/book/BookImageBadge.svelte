<script lang="ts">
	import { defaultUserListLabelsArray, defaultUserListLabelsColorMap } from '$lib/db/dbConsts';
	import LabelIcon from '../icon/LabelIcon.svelte';

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
			<div
				class="dark-main-text w-fit text-sm sm:text-base rounded-full px-2 flex items-center gap-1 drop-shadow-md"
				style:background-color={defaultUserListLabelsArray.includes(badge as any)
					? `${defaultUserListLabelsColorMap[badge]}EA`
					: '#000000CA'}
			>
				{#if defaultUserListLabelsArray.includes(badge as any)}
					<div class="">
						<LabelIcon label={badge} size="small" />
					</div>
				{/if}
				<p>{badge}</p>
			</div>
		{/if}
	{/each}
</div>
