<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();

	let release = $derived(data.release);
</script>

<PageTitle title="Add release" />
<NoIndex />

<main class="container-rndb">
	<ReleaseForm
		releaseForm={data.form}
		{release}
		type="add"
		user={data.user}
		actionUrl="/releases/add"
	/>
</main>
