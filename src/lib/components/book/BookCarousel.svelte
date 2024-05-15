<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	let width: number = 0;
	let counter = 0;
	let carouselContainer: HTMLDivElement;
	$: numTracks = carouselContainer?.scrollWidth / width - 1;

	function scrollTo(element: HTMLElement, to: number, duration: number) {
		const start = element.scrollLeft;
		const change = to - start;
		let currentTime = 0;
		const increment = 25;

		function animateScroll() {
			currentTime += increment;
			const val = easeOutQuint(currentTime, start, change, duration);
			element.scrollLeft = val;
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
</script>

<svelte:window on:resize={onWindowResize} />

<div class="flex flex-col gap-2">
	<div class="flex gap-2 items-center">
		<button
			type="button"
			class="btn rounded-full"
			disabled={counter <= 0}
			aria-label="Previous"
			on:click={() => {
				scrollTo(carouselContainer, (counter - 1) * width, animationDuration);
				counter--;
			}}><Icon name="chevronLeft" /></button
		>
		<button
			type="button"
			class="btn rounded-full"
			disabled={counter >= Math.ceil(numTracks)}
			aria-label="Next"
			on:click={() => {
				if (counter === Math.floor(numTracks)) {
					scrollTo(carouselContainer, carouselContainer.scrollWidth - width, animationDuration);
				} else {
					scrollTo(carouselContainer, (counter + 1) * width, animationDuration);
				}
				counter++;
			}}><Icon name="chevronRight" /></button
		>
	</div>

	<div class="grid overflow-x-hidden" bind:clientWidth={width}>
		<div class="carousel-container overflow-x-hidden" bind:this={carouselContainer}>
			<slot />
		</div>
	</div>
</div>
