<script lang="ts">
	import StaffForm from '$lib/components/form/staff/StaffForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();

	let staff = $derived(data.staff);
</script>

<PageTitle title="Add staff" />
<NoIndex />

<main class="container-rndb">
	<StaffForm {staff} staffForm={data.form} type="add" user={data.user} actionUrl="/staff/add" />
</main>
