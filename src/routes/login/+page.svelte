<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LoginForm from '$lib/components/form/auth/LoginForm.svelte';

	export let data;
</script>

<PageTitle title="Log in" />

<main class="container-rndb flex justify-center">
	<LoginForm loginForm={data.form} />
</main>
