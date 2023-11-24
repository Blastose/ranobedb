<script lang="ts">
	import SubmitButton from './SubmitButton.svelte';

	export let enhance: (e: HTMLFormElement) => {};
	export let headingText: string;
	export let submitText: string;
	export let submitting: boolean;
	export let delayed: boolean;
</script>

<section class="auth-form-shell">
	<h1 class="font-bold text-4xl">{headingText}</h1>

	<slot name="alert" />

	<form class="auth-form" method="post" use:enhance>
		<section class="flex flex-col gap-2">
			<slot name="form" />
		</section>

		<SubmitButton {submitting} {delayed} text={submitText} />
	</form>

	<slot name="bottom" />
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
