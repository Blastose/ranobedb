<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';

	export let key: string;

	beforeNavigate((beforeNavigate) => {
		if (beforeNavigate.delta && beforeNavigate.delta < 0) {
			flyDirection = -1;
		} else {
			flyDirection = 1;
		}
	});

	let flyDirection = 1;
	let flyXOffset = 50;
</script>

{#if key !== 'skip'}
	{#key key}
		<div in:fly={{ x: flyXOffset * flyDirection, duration: 500, easing: quintOut }}>
			<slot />
		</div>
	{/key}
{:else}
	<slot />
{/if}
