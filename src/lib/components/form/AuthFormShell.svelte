<script lang="ts">
	import SubmitButton from './SubmitButton.svelte';

	export let enhance: (e: HTMLFormElement) => {};
	export let headingText: string;
	export let submitText: string;
	export let submitting: boolean;
	export let delayed: boolean;
</script>

<section class="flex flex-col justify-center w-full gap-4 max-w-xl">
	<h1 class="font-bold text-4xl">{headingText}</h1>

	<slot name="alert" />

	<form class="flex flex-col gap-4" method="post" use:enhance>
		<section class="flex flex-col gap-2">
			<slot name="form" />
		</section>

		<SubmitButton {submitting} {delayed} text={submitText} />
	</form>

	<slot name="bottom" />
</section>
