<script lang="ts">
	import PublisherForm from '$lib/components/form/publisher/PublisherForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Add publisher" />

<main class="container-rndb">
	<PublisherForm publisherForm={data.form} publisher={undefined} type="add" user={data.user} />
</main>
