<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import NoIndex from '../layout/NoIndex.svelte';
	import MarkdownToHtml from '../markdown/MarkdownToHtml.svelte';

	export let title: string;
	export let reason: string;
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="font-bold text-lg">{title}</h1>

	<section class="flex flex-col gap-2">
		<h2 class="font-bold text-lg error-text-color">Item deleted</h2>

		<p>
			This item has been deleted from the database.
			<br />
			If you believe this item should be restored, please leave a message on our
			<a href="https://discord.gg/ZeAnhGncFx" class="link" target="_blank">Discord server</a>.
		</p>

		<section class="mt-4">
			<h3 class="font-bold">Reason for deletion:</h3>
			<MarkdownToHtml markdown={reason} type="full" />
		</section>
	</section>
</main>
