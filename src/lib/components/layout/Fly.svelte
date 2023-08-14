<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';

	export let key: any;
	// We check if key !== skip below because if we only check if fly is truthy,
	// we may not transition when we want to since the url.param is undefined

	beforeNavigate((beforeNavigate) => {
		if (beforeNavigate.delta && beforeNavigate.delta < 0) {
			flyDirection = -1;
		} else {
			flyDirection = 1;
		}
	});

	let flyDirection = 1;
	$: flyXOffset = 30;
</script>

{#if key !== 'skip'}
	{#key key}
		<div in:fly={{ x: flyXOffset * flyDirection, duration: 250, easing: cubicOut }}>
			<slot />
		</div>
	{/key}
{:else}
	<slot />
{/if}
