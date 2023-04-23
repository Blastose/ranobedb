<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormMarkdownEditor from '$lib/components/form/FormMarkdownEditor.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import { page } from '$app/stores';

	export let form: ActionData;
	export let data: PageData;
	let loading: boolean;
	let name = data.person.name ?? '';
	let nameRomaji = data.person.name_romaji ?? '';
	let description = data.person.description_markdown ?? '';
</script>

<svelte:head>
	<title>Edit {data.person.name} - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Edit {data.person.name}</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success">Edited person successfully!</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">
				Person <span class="text-sm text-gray-500 dark:text-gray-400">id{$page.params.id}</span>
			</h2>

			<FormInput
				bind:value={name}
				name="name"
				id="name"
				type="text"
				labelName="Name"
				required={true}
				placeholder="Name"
				error={form?.nameError?.message}
			/>

			<FormInput
				bind:value={nameRomaji}
				name="nameRomaji"
				id="nameRomaji"
				type="text"
				labelName="Name Romaji"
				placeholder="Name Romaji"
				error={form?.nameRomajiError?.message}
			/>

			<FormMarkdownEditor
				bind:text={description}
				formIdName="description"
				formLabel="Biography"
				rows={6}
				placeholder="Add biography..."
				error={form?.descriptionError?.message}
			/>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit Edit'} />
		</div>
	</Form>
</main>
