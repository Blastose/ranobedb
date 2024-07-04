<script lang="ts">
	import PublisherForm from '$lib/components/form/publisher/PublisherForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: publisher = data.publisher;
</script>

<PageTitle title="Add publisher" />
<NoIndex />

<main class="container-rndb">
	<PublisherForm
		publisherForm={data.form}
		{publisher}
		type="add"
		user={data.user}
		actionUrl="/publishers/add"
	/>
</main>
