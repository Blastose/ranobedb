<script lang="ts">
	// Adapted from https://github.com/ghostdevv/svelte-turnstile/blob/main/src/lib/Turnstile.svelte

	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';

	export let callback: (token: string) => void = () => {};
	export let validToken = PUBLIC_CF_TURNSTILE_SITE_KEY === '1x00000000000000000000AA';

	let loaded = hasTurnstile();
	let mounted = false;
	let widgetId: string | HTMLElement | undefined;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});

	function hasTurnstile() {
		if (typeof window == 'undefined') return null;
		return 'turnstile' in window;
	}

	function loadCallback() {
		loaded = true;
	}

	export function reset(): void {
		window.turnstile.reset(widgetId);
	}

	const turnstile: Action = (node) => {
		validToken = PUBLIC_CF_TURNSTILE_SITE_KEY === '1x00000000000000000000AA';

		const id = window.turnstile.render(node, {
			sitekey: PUBLIC_CF_TURNSTILE_SITE_KEY,
			callback: (token: string) => {
				validToken = true;
				callback(token);
			},
		});

		widgetId = id ?? undefined;

		return {
			destroy: () => {
				window.turnstile.remove(widgetId);
			},
		};
	};
</script>

<svelte:head>
	{#if mounted && !loaded && PUBLIC_CF_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA'}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			on:load={loadCallback}
			async
		></script>
	{/if}
</svelte:head>

{#if PUBLIC_CF_TURNSTILE_SITE_KEY !== '1x00000000000000000000AA'}
	{#if loaded && mounted}
		<div class="w-[300px] h-[65px]" use:turnstile></div>
	{:else}
		<div class="w-[300px] h-[65px]"></div>
	{/if}
{/if}
