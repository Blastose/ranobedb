<script lang="ts">
	import StaffForm from '$lib/components/form/staff/StaffForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: staff = data.staff;
</script>

<PageTitle title="Editing {staff.name ?? ''}" />

<main class="container-rndb">
	<StaffForm {staff} staffForm={data.form} type="edit" user={data.user} />
</main>
