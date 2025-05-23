<script lang="ts">
	import { run } from 'svelte/legacy';

	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';

	let width = $state(0);
	let progressTimeoutId: ReturnType<typeof setTimeout>;
	let progressDoneTimeoutId: ReturnType<typeof setTimeout>;
	let progressIntervalId: ReturnType<typeof setInterval>;
	let progressRunning = $state(false);
	let progressComplete = true;

	function clearTimeoutsAndIntervals() {
		clearTimeout(progressTimeoutId);
		clearTimeout(progressDoneTimeoutId);
		clearInterval(progressIntervalId);
	}

	function progressStart() {
		progressRunning = true;
		progressComplete = false;
		width = 0;
		progressIntervalId = setInterval(() => {
			if (width >= 50) {
				width += Math.random() * 2;
			} else if (width >= 80) {
				if (Math.random() > 0.5) {
					width += Math.random() * 2 + 1;
				}
			} else {
				width += Math.random() * 2 + 3;
			}
		}, 250);
	}

	function progressDone() {
		width = 120;
		clearTimeoutsAndIntervals();

		if (progressRunning) {
			progressDoneTimeoutId = setTimeout(() => {
				progressRunning = false;
				progressComplete = true;
			}, 150);
		}
	}

	function setTimeoutProgress() {
		clearTimeoutsAndIntervals();
		progressTimeoutId = setTimeout(() => {
			progressStart();
		}, 500);
	}

	run(() => {
		if ($navigating) {
			setTimeoutProgress();
		} else if (!$navigating) {
			progressDone();
		}
	});
</script>

<!-- Debug -->
<!-- {progressRunning}
<button
	on:click={() => {
		setTimeoutProgress();
	}}>Start</button
><button
	on:click={() => {
		progressDone();
	}}>Done</button
> -->
{#if progressRunning}
	<div class="progress-container" in:fade out:fade>
		<div class="progress {width >= 100 ? 'animate-pulse' : ''}" style="width: {width}%"></div>
	</div>
{/if}

<style>
	.progress-container {
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 0.25rem;
		z-index: 999999999;
		pointer-events: none;
		background-color: rgb(99, 102, 105);
	}

	:global(.dark) .progress-container {
		height: 0.125rem;
		background-color: rgb(49, 49, 49);
	}

	.progress {
		height: 100%;
		background-color: rgb(156, 149, 255);
		transition: width 300ms linear;
	}

	:global(.dark) .progress {
		height: 100%;
		background-color: var(--primary-400);
	}
</style>
