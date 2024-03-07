<script lang="ts">
	import PublisherForm from '$lib/components/form/publisher/PublisherForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: publisher = data.publisher;
</script>

<PageTitle title="Editing {publisher.name}" />

<main class="container-rndb">
	<PublisherForm publisherForm={data.form} {publisher} type="edit" user={data.user} />
</main>
