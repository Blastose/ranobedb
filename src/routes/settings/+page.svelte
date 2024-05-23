<script>
	import SettingsForm from '$lib/components/form/settings/SettingsForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Settings" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="font-bold text-4xl">Settings</h1>

	<SettingsForm
		usernameForm={data.usernameForm}
		passwordForm={data.passwordForm}
		displayPrefsForm={data.displayPrefsForm}
		view={data.view}
	/>
</main>
