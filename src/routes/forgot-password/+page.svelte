<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ForgotPasswordForm from '$lib/components/form/auth/ForgotPasswordForm.svelte';

	let { data } = $props();
</script>

<PageTitle title="Forgot password" />

<main class="container-rndb flex justify-center">
	<ForgotPasswordForm forgotPasswordForm={data.form} />
</main>
