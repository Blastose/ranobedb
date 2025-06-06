<script lang="ts">
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';

	let parentDescriptionElement: HTMLDivElement | undefined = $state();
	let descriptionElement: HTMLParagraphElement | undefined = $state();
	let descriptionElementClientHeight = $state(0);
	let expandedDescription: boolean = $state(false);

	interface Props {
		description: string;
		maxHeight?: number;
	}

	let { description, maxHeight = $bindable(256) }: Props = $props();
	let maxHeightNotExpanded = maxHeight;
	let hydration = $state(true);

	function resizeDescription() {
		if (expandedDescription) {
			maxHeight = descriptionElement!.clientHeight;
		} else {
			maxHeight = maxHeightNotExpanded;
		}
		descriptionElementClientHeight = descriptionElement!.clientHeight;
	}

	let timeout: ReturnType<typeof setTimeout>;
	let delay = 300;
	function handleWindowResize() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			resizeDescription();
		}, delay);
	}

	function removeHydration(el: HTMLElement) {
		descriptionElementClientHeight = el.clientHeight;
		hydration = false;
	}
</script>

<svelte:window onresize={handleWindowResize} />

<div class="description-container">
	<div style:max-height="{maxHeight}px" bind:this={parentDescriptionElement} class="description">
		<div use:removeHydration bind:this={descriptionElement} class="description">
			<MarkdownToHtml markdown={description} type="full" />
		</div>
	</div>

	{#if hydration || descriptionElementClientHeight > maxHeightNotExpanded}
		<button
			type="button"
			transition:fade={{ duration: 150 }}
			class="hide-text-gradient
      {expandedDescription ? 'mt-0' : '-mt-10'}"
			onclick={() => {
				expandedDescription = !expandedDescription;
				resizeDescription();
			}}
			aria-label={expandedDescription ? 'Show less' : 'Show more'}
		>
			<span
				class="{hydration ? 'invisible opacity-0' : 'inline opacity-100'}
					 {expandedDescription ? 'rotate-90' : '-rotate-90'}
					 duration-500 chevron-icon"
			>
				<Icon name="chevronLeft" />
			</span>
			<span
				class="{hydration ? 'invisible opacity-0' : 'inline opacity-100'}
					 duration-500 expand-description-text">{expandedDescription ? 'Show less' : 'Show more'}</span
			>
		</button>
	{/if}
</div>

<style>
	.description-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.description {
		max-width: 64rem;
		overflow: hidden;
		transition: max-height 300ms;
	}

	.expand-description-text {
		margin-top: -0.5rem;
		font-size: 0.75rem;
		line-height: 1rem;
	}

	.chevron-icon {
		transition: transform 200ms;
		transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	}

	.hide-text-gradient {
		transition: margin 300ms;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			rgba(0, 0, 0, 0) 0%,
			rgba(242, 242, 242, 0.781) 50%,
			rgba(242, 242, 242, 1) 100%
		);
	}

	:global(.dark) .hide-text-gradient {
		background: linear-gradient(
			rgba(255, 255, 255, 0) 0%,
			rgba(34, 34, 34, 0.781) 50%,
			rgba(34, 34, 34, 1) 100%
		);
	}
</style>
