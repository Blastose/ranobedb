<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	interface Props {
		link?: import('svelte').Snippet;
		items?: import('svelte').Snippet;
	}

	let { link, items }: Props = $props();

	let width: number = $state(0);
	let counter = $state(0);
	let carouselContainer: HTMLDivElement | undefined = $state();
	let numTracks = $derived(carouselContainer ? carouselContainer.scrollWidth / width - 1 : 1);

	function scrollTo(element: HTMLElement | undefined, to: number, duration: number) {
		if (!element) {
			return;
		}
		const start = element.scrollLeft;
		const change = to - start;
		let currentTime = 0;
		const increment = 25;

		function animateScroll() {
			currentTime += increment;
			const val = easeOutQuint(currentTime, start, change, duration);
			if (element) {
				element.scrollLeft = val;
			}
			if (currentTime < duration) {
				requestAnimationFrame(animateScroll);
			}
		}

		animateScroll();
	}

	function easeOutQuint(currentTime: number, start: number, change: number, duration: number) {
		currentTime /= duration;
		currentTime--;
		return (
			change * (currentTime * currentTime * currentTime * currentTime * currentTime + 1) + start
		);
	}
	let animationDuration = 1000;

	let timeout: ReturnType<typeof setTimeout>;
	let delay = 300;
	function onWindowResize() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			scrollTo(carouselContainer, 0, 1000);
			counter = 0;
		}, delay);
	}

	let buttonDimensions = '28';
</script>

<svelte:window onresize={onWindowResize} />

<div class="flex flex-col gap-2">
	<div class="flex justify-between items-center">
		{@render link?.()}

		<div class="flex items-center">
			<button
				type="button"
				class="btn rounded-full"
				disabled={counter <= 0}
				aria-label="Previous"
				onclick={() => {
					scrollTo(carouselContainer, (counter - 1) * width, animationDuration);
					counter--;
				}}><Icon name="chevronLeft" height={buttonDimensions} width={buttonDimensions} /></button
			>
			<button
				type="button"
				class="btn rounded-full"
				disabled={counter >= Math.ceil(numTracks)}
				aria-label="Next"
				onclick={() => {
					if (counter === Math.floor(numTracks)) {
						scrollTo(carouselContainer, carouselContainer!.scrollWidth - width, animationDuration);
					} else {
						scrollTo(carouselContainer, (counter + 1) * width, animationDuration);
					}
					counter++;
				}}><Icon name="chevronRight" height={buttonDimensions} width={buttonDimensions} /></button
			>
		</div>
	</div>

	<div class="grid overflow-x-hidden overflow-y-hidden" bind:clientWidth={width}>
		<div class="carousel-container overflow-x-hidden" bind:this={carouselContainer}>
			{@render items?.()}
		</div>
	</div>
</div>
