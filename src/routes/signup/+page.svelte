<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import SignupForm from '$lib/components/form/auth/SignupForm.svelte';

	let { data } = $props();
</script>

<PageTitle title="Sign up" />

<main class="container-rndb flex justify-center">
	<SignupForm signupForm={data.form} />
</main>
