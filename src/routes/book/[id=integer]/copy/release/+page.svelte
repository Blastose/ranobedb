<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Add release" />

<main class="container-rndb">
	<ReleaseForm
		release={undefined}
		releaseForm={data.form}
		type="add"
		user={data.user}
		actionUrl="/releases/add"
	/>
</main>
