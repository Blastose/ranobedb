<script lang="ts">
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	export let enhance: (e: HTMLFormElement) => {};
	export let topText: string;
	export let buttonText: string;
	export let loading: boolean;
</script>

<main class="mx-auto max-w-xl pt-4 px-4 flex flex-col gap-4">
	<h1 class="text-2xl font-bold">{topText}</h1>

	<slot name="alert" />

	<form method="POST" class="flex flex-col gap-4" use:enhance>
		<div class="flex flex-col gap-2">
			<slot name="form" />
		</div>

		<FormSubmitButton text={buttonText} {loading} />
	</form>

	<slot name="bottom" />
</main>
