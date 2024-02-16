<script lang="ts">
	import { fade } from 'svelte/transition';
	import Icon from '../icon/Icon.svelte';

	export let description: string;

	let parentDescriptionElement: HTMLDivElement;
	let descriptionElement: HTMLParagraphElement;
	let descriptionElementClientHeight = 0;
	let expandedDescription: boolean = false;

	let maxHeightNotExpanded = 256;
	let maxHeight = 256;
	let hydration = true;

	function resizeDescription() {
		if (expandedDescription) {
			maxHeight = descriptionElement.clientHeight;
		} else {
			maxHeight = maxHeightNotExpanded;
		}
		descriptionElementClientHeight = descriptionElement.clientHeight;
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

<svelte:window on:resize={handleWindowResize} />

<div class="description-container">
	<div style:max-height="{maxHeight}px" bind:this={parentDescriptionElement} class="description">
		<!-- TODO Maybe use markdown instead of whitespace-pre-wrap -->
		<p use:removeHydration class="whitespace-pre-wrap" bind:this={descriptionElement}>
			{description}
		</p>
	</div>

	{#if hydration || descriptionElementClientHeight > maxHeightNotExpanded}
		<button
			type="button"
			transition:fade={{ duration: 150 }}
			class="hide-text-gradient
      {expandedDescription ? 'mt-0' : '-mt-10'}"
			on:click={() => {
				expandedDescription = !expandedDescription;
				resizeDescription();
			}}
			aria-label={expandedDescription ? 'Show less' : 'Show more'}
		>
			<span class="chevron-icon {expandedDescription ? 'rotate-90' : '-rotate-90'}">
				<Icon name="chevronLeft" />
			</span>
			<span class="expand-description-text">{expandedDescription ? 'Show less' : 'Show more'}</span>
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
		transition-duration: 300ms;
	}

	.expand-description-text {
		margin-top: -0.5rem;
		font-size: 0.75rem /* 12px */;
		line-height: 1rem /* 16px */;
	}

	.chevron-icon {
		transition: transform 200ms;
		transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	}

	.hide-text-gradient {
		transition-duration: 300ms;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			rgba(0, 0, 0, 0) 0%,
			rgba(242, 242, 242, 0.781) 25%,
			rgba(242, 242, 242, 1) 100%
		);
	}

	:global(.dark) .hide-text-gradient {
		background: linear-gradient(
			rgba(255, 255, 255, 0) 0%,
			rgba(34, 34, 34, 0.781) 25%,
			rgba(34, 34, 34, 1) 100%
		);
	}
</style>
