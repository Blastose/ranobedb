<script lang="ts">
	import StaffForm from '$lib/components/form/staff/StaffForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Adding staff" />

<main class="container-rndb">
	<StaffForm staff={undefined} staffForm={data.form} type="edit" user={data.user} />
</main>
