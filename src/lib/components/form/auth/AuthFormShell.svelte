<script lang="ts">
	import { PUBLIC_CF_TURNSTILE_SITE_KEY } from '$env/static/public';
	import SubmitButton from '../SubmitButton.svelte';
	import Turnstile from '../cf/Turnstile.svelte';

	interface Props {
		enhance: (e: HTMLFormElement) => {};
		headingText: string;
		submitText: string;
		submitting: boolean;
		delayed: boolean;
		turnstileKey: number;
		useTurnstile?: boolean;
		alert?: import('svelte').Snippet;
		form_shell?: import('svelte').Snippet;
		bottom?: import('svelte').Snippet;
	}

	let {
		enhance,
		headingText,
		submitText,
		submitting,
		delayed,
		turnstileKey,
		useTurnstile = true,
		alert,
		form_shell,
		bottom,
	}: Props = $props();

	let cfValid: boolean = $derived(
		!useTurnstile || PUBLIC_CF_TURNSTILE_SITE_KEY === '1x00000000000000000000AA',
	);
</script>

<section class="auth-form-shell">
	<h1 class="text-4xl font-bold">{headingText}</h1>

	{@render alert?.()}

	<form class="auth-form" method="post" use:enhance>
		<section class="flex flex-col gap-2">
			{@render form_shell?.()}
		</section>

		{#if useTurnstile}
			{#key turnstileKey}
				<Turnstile bind:validToken={cfValid} />
			{/key}
		{/if}

		<SubmitButton {submitting} {delayed} text={submitText} disabled={!cfValid} />
	</form>

	{@render bottom?.()}
</section>

<style>
	.auth-form-shell {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		gap: 1rem;
		max-width: 36rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
