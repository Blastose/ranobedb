<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormMarkdownEditor from '$lib/components/form/FormMarkdownEditor.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';

	export let form: ActionData;

	let loading: boolean;
	let name = '';
	let nameRomaji = '';
	let description = '';
</script>

<svelte:head>
	<title>Add Person - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Add Person</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success"
			>Added person successfully! <a
				href="/person/{form?.addedPersonId}"
				class="text-blue-800 hover:underline">Find the person at /person/{form?.addedPersonId}.</a
			></Alert
		>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Person</h2>

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
			<FormSubmitButton {loading} text={'Submit'} />
		</div>
	</Form>
</main>
