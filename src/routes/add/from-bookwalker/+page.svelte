<script lang="ts">
	import type { PageProps } from './$types';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import UrlInput from '$lib/components/form/scraper/UrlInput.svelte';
	import Add from '$lib/components/form/scraper/Add.svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { scrapedBookDataSchema } from '$lib/server/zod/schema';

	let {
		data,
		form,
	}: Omit<PageProps, 'form'> & {
		form: { form: SuperValidated<Infer<typeof scrapedBookDataSchema>> | undefined } | undefined;
	} = $props();
</script>

<PageTitle title="Add from BookWalker JP" />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">Add from BookWalker JP</h1>

	{#if !form?.form}
		<UrlInput urlForm={data.urlSchemaForm} />
	{/if}

	{#if form?.form}
		<Add addForm={form.form} />
	{/if}
</main>
