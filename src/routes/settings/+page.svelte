<script lang="ts">
	import SettingsForm from '$lib/components/form/settings/SettingsForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ThemeSelect from '$lib/components/form/settings/ThemeSelect.svelte';

	export let data;
</script>

<PageTitle title="Settings" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="font-bold text-4xl">Settings</h1>

	{#if data.type === 'user'}
		<SettingsForm
			usernameForm={data.usernameForm}
			passwordForm={data.passwordForm}
			displayPrefsForm={data.displayPrefsForm}
			view={data.view}
		/>
	{:else}
		<h2 class="text-2xl font-bold">Display preferences</h2>
		<section>
			<h3 class="text-lg font-bold">Theme</h3>

			<ThemeSelect />
		</section>
	{/if}
</main>
