<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import BookImage from '$lib/components/book/BookImage.svelte';

	export let books: BookInfo[];
	let scroll = false;

	const useSwipe = (node: HTMLDivElement) => {
		let pointerStartX: number;
		let pointerCurrentX: number;
		let scrollLeftStart: number = 0;
		let moving: boolean = false;
		let velocityX: number;

		const pointerStart = (e: PointerEvent) => {
			cancelAnimationFrame(decelerationId);
			pointerStartX = e.x;
			moving = true;
		};

		const pointerEnd = (e: PointerEvent) => {
			if (moving === true) {
				moving = false;
				scrollLeftStart = node.scrollLeft;
				scroll = false;
			}
			beginDeceleration();
			e.preventDefault();
		};

		const pointerMove = (e: PointerEvent) => {
			pointerCurrentX = e.x;
			if (moving) {
				scroll = true;
				let diff = pointerCurrentX - pointerStartX;
				const prevScrollLeft = node.scrollLeft;
				node.scrollLeft = scrollLeftStart - diff;
				velocityX = node.scrollLeft - prevScrollLeft;
			}
		};

		let decelerationId: number;
		const beginDeceleration = () => {
			cancelAnimationFrame(decelerationId);
			decelerationId = requestAnimationFrame(decelerationLoop);
		};

		const decelerationLoop = () => {
			node.scrollLeft += velocityX;
			scrollLeftStart = node.scrollLeft;
			velocityX *= 0.95;
			if (Math.abs(velocityX) > 0.5) {
				decelerationId = requestAnimationFrame(decelerationLoop);
			}
		};

		node.addEventListener('pointerdown', pointerStart);
		node.addEventListener('pointerup', pointerEnd);
		node.addEventListener('pointermove', pointerMove);

		return {
			destroy() {
				node.removeEventListener('pointerdown', pointerStart);
				node.removeEventListener('pointerup', pointerEnd);
				node.removeEventListener('pointermove', pointerMove);
			}
		};
	};
</script>

<div class="grid">
	<div class="swipe-container" use:useSwipe>
		{#each books as book}
			<div class="item">
				<BookImage {book} hover={false} drag={false} {scroll} />
			</div>
		{/each}
	</div>
</div>

<style>
	.swipe-container {
		display: flex;
		gap: 0.5rem;
		user-select: none;
		overflow-x: hidden;
	}

	.item {
		flex: 0 0 25%;
	}

	@media (min-width: 640px) {
		.item {
			flex: 0 0 20%;
		}
	}
	@media (min-width: 768px) {
		.item {
			flex: 0 0 16%;
		}
	}
	@media (min-width: 1280px) {
		.item {
			flex: 0 0 14%;
		}
	}
	@media (min-width: 1536px) {
		.item {
			flex: 0 0 10%;
		}
	}
</style>
