<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ResetPasswordForm from '$lib/components/form/auth/ResetPasswordForm.svelte';

	export let data;
</script>

<PageTitle title="Reset password" />

<main class="container-rndb flex justify-center">
	<ResetPasswordForm resetPasswordForm={data.form} />
</main>
