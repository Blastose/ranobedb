<script lang="ts">
	import BookBanner from './BookBanner.svelte';
	import type { BookInfo } from '$lib/types/dbTypes';
	import Icon from '$lib/components/icon/Icon.svelte';
	export let books: BookInfo[];
	export let title: string;

	books = books.slice(40, 50);
	let max: number = books.length;
	let pos: number = 0;

	const incPos = () => {
		pos = (pos + 1) % max;
	};
	const decPos = () => {
		pos = pos - 1;
		if (pos < 0) {
			pos = max - 1;
		}
	};

	let animateSwipeLeft: boolean = false;
	let animateSwipeRight: boolean = false;
	let ease: boolean = false;
	const useSwipe = (node: HTMLDivElement) => {
		let pointerStartX: number;
		let pointerEndX: number;
		let pointerCurrentX: number;
		let moving: boolean = false;

		const handleSwipe = () => {
			if (Math.abs(pointerEndX - pointerStartX) > 25) {
				if (pointerEndX < pointerStartX) {
					incPos();
				} else if (pointerEndX > pointerStartX) {
					decPos();
				}
			}
			node.style.transform = `translate(0px, 0px)`;
		};

		const pointerStart = (e: PointerEvent) => {
			pointerStartX = e.x;
			moving = true;
		};

		const pointerEnd = (e: PointerEvent) => {
			pointerEndX = e.x;
			moving = false;
			ease = true;
			handleSwipe();
		};

		const pointerMove = (e: PointerEvent) => {
			pointerCurrentX = e.x;
			if (moving) {
				let diff = (pointerCurrentX - pointerStartX) / 4;
				const MAX_X_DIFF = 45;
				diff = Math.max(-MAX_X_DIFF, Math.min(diff, MAX_X_DIFF));
				node.style.transform = `translate(${diff}px, 0px)`;
			}
		};

		const clearEase = () => {
			ease = false;
		};

		const clearAnimation = () => {
			animateSwipeLeft = false;
			animateSwipeRight = false;
		};

		node.addEventListener('pointerdown', pointerStart);
		node.addEventListener('pointerup', pointerEnd);
		node.addEventListener('pointermove', pointerMove);
		node.addEventListener('transitionend', clearEase);
		node.addEventListener('animationend', clearAnimation);
		node.addEventListener('animationcancel', clearAnimation);

		return {
			destroy() {
				node.removeEventListener('pointerdown', pointerStart);
				node.removeEventListener('pointerup', pointerEnd);
				node.removeEventListener('pointermove', pointerMove);
				node.removeEventListener('transitionend', clearEase);
				node.removeEventListener('animationend', clearAnimation);
				node.removeEventListener('animationcancel', clearAnimation);
			}
		};
	};
</script>

<div class="flex flex-col gap-2 overflow-hidden">
	<p class="font-bold text-xl">{title}</p>
	<p>#{pos + 1}/{max}</p>
	<div
		use:useSwipe
		class:swiper={ease}
		class:swipe-left={animateSwipeLeft}
		class:swipe-right={animateSwipeRight}
		class="select-none"
		aria-live="polite"
		aria-atomic="true"
	>
		<BookBanner book={books[pos]} />
	</div>

	<div class="grid grid-cols-3 items-center">
		<!-- Empty div to center and right the next 2 components since we are using grid-cols-3 -->
		<div />
		<div class="flex flex-wrap gap-2 justify-self-center">
			{#each books as _, i}
				<button
					class="carousel-button {pos === i ? 'active' : ''}"
					aria-label={`jump to carousel #${i}`}
					on:click={() => {
						if (i < pos) {
							animateSwipeLeft = true;
						} else if (i > pos) {
							animateSwipeRight = true;
						}
						pos = i;
					}}
				/>
			{/each}
		</div>

		<div class="flex gap-2 justify-self-end">
			<button
				class="button"
				disabled={animateSwipeLeft || animateSwipeRight}
				aria-label="carousel left"
				on:click={() => {
					decPos();
					animateSwipeLeft = true;
				}}
			>
				<Icon height="30" width="30" name="chevronLeft" />
			</button>
			<button
				class="button"
				disabled={animateSwipeLeft || animateSwipeRight}
				aria-label="carousel right"
				on:click={() => {
					incPos();
					animateSwipeRight = true;
				}}
			>
				<Icon height="30" width="30" name="chevronRight" />
			</button>
		</div>
	</div>
</div>

<style>
	.swiper {
		transition-duration: 150ms;
	}

	.button {
		color: white;
		padding: 0.25rem;
		background-color: var(--primary-500);
		border-radius: 9999px;
		transition-duration: 150ms;
	}

	.button:hover {
		background-color: var(--primary-800);
	}

	.carousel-button {
		padding: 0.5rem;
		transition-duration: 300ms;
		height: min-content;
		width: min-content;
		border-radius: 9999px;
		background-color: var(--primary-200);
	}

	.carousel-button:hover {
		background-color: var(--primary-500);
	}

	.carousel-button.active {
		background-color: var(--primary-500);
	}

	.swipe-left {
		animation-duration: 300ms;
		animation-timing-function: ease-in-out;
		animation-name: swipeleft;
	}

	.swipe-right {
		animation-duration: 300ms;
		animation-timing-function: ease-in-out;
		animation-name: swiperight;
	}

	@keyframes swipeleft {
		50% {
			transform: translate(12px);
		}

		100% {
			transform: translate(0px);
		}
	}

	@keyframes swiperight {
		50% {
			transform: translate(-12px);
		}

		100% {
			transform: translate(0px);
		}
	}
</style>
