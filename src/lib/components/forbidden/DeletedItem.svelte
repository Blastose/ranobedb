<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import MarkdownToHtml from '../markdown/MarkdownToHtml.svelte';

	export let title: string;
	export let reason: string;

	// TODO change contact message
</script>

<PageTitle {title} />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="font-bold text-lg">{title}</h1>

	<section class="flex flex-col gap-2">
		<h2 class="font-bold text-lg error-text-color">Item deleted</h2>

		<p>
			This item has been deleted from the database.
			<br />
			If you believe this item should be restored, please contact the developer.
		</p>

		<section class="mt-4">
			<h3 class="font-bold">Reason for deletion:</h3>
			<MarkdownToHtml markdown={reason} type="full" />
		</section>
	</section>
</main>
