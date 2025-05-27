<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();
</script>

<PageTitle title="Add release" />
<NoIndex />

<main class="container-rndb">
	<ReleaseForm release={undefined} releaseForm={data.form} type="add" user={data.user} />
</main>
