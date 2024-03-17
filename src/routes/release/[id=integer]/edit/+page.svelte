<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: release = data.release;
</script>

<PageTitle title="Editing {release.title}" />

<main class="container-rndb">
	<ReleaseForm releaseForm={data.form} {release} type="edit" user={data.user} />
</main>
