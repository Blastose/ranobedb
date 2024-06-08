<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: release = data.release;
</script>

<PageTitle title="Add release" />

<main class="container-rndb">
	<ReleaseForm
		releaseForm={data.form}
		{release}
		type="add"
		user={data.user}
		actionUrl="/releases/add"
	/>
</main>
