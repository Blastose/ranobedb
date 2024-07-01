<script lang="ts">
	import type { UserLabel } from '$lib/server/db/user/list';

	export let userLabel: UserLabel;
	export let activeLabels: number[];
	$: active = activeLabels.includes(userLabel.label_id);
</script>

<div class="flex flex-col gap-1">
	<a class="font-bold reading-label" class:active href="?l={userLabel.label_id}"
		>{userLabel.label} ({userLabel.book_count})</a
	>
	<div class="box-underline" class:active />
</div>

<style>
	.reading-label {
		transition: color 300ms;
	}

	.reading-label.active {
		color: #64649e;
	}

	:global(.dark) .reading-label.active {
		color: #aeaed8;
	}

	.reading-label:hover:not(.active) {
		color: #7171a5;
	}

	:global(.dark) .reading-label:hover {
		color: #a9a9ce;
	}

	.box-underline {
		width: 100%;
		height: 0.166rem;
		transition: background-color 300ms;
		border-radius: 2rem 2rem 0px 0px;
	}

	.box-underline.active {
		background-color: var(--primary-500);
	}

	:global(.dark) .box-underline.active {
		background-color: var(--primary-500);
	}
</style>
