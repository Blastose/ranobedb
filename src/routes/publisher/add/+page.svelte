<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormMarkdownEditor from '$lib/components/form/FormMarkdownEditor.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import { PublisherRelTypeArray, type PublisherRelType } from '$lib/types/dbTypes';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import { page } from '$app/stores';

	export let form: ActionData;

	let loading: boolean;
	let name = '';
	let nameRomaji = '';
	let description = '';

	let publishers: (Publisher & { type: PublisherRelType })[] = [];

	type Publisher = { id: number; name: string };

	const addPublisherToArray = (publisher: Publisher) => {
		if (publisher.id === Number($page.params.id)) return;
		publishers.push({ ...publisher, type: 'label' });
		publishers = publishers;
	};
</script>

<svelte:head>
	<title>Add Publisher - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Add Publisher</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success"
			>Added publisher successfully! <a
				href="/publisher/{form?.addedPublisherId}"
				class="text-blue-800 hover:underline"
				>Find the publisher at /publisher/{form?.addedPublisherId}.</a
			></Alert
		>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Publisher</h2>

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
				formLabel="About"
				rows={6}
				error={form?.descriptionError?.message}
				placeholder="Add about text..."
			/>

			<div class="flex flex-col gap-2">
				<h2 class="font-bold text-xl">Database Relations</h2>
				<FormSearchList
					searchId="search-publisher-add-publisher"
					dropdown={{ itemAttribute: 'type', dropdownValues: PublisherRelTypeArray }}
					fetchUrl="/api/publisher?name="
					formItemName="publisherRel"
					items={publishers}
					headerName="Publishers"
					onSearchItemClick={addPublisherToArray}
					searchPlaceholder="Search publishers..."
					baseUrl="publisher"
					error={form?.duplicatePublisherError?.message}
				/>
			</div>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit'} />
		</div>
	</Form>
</main>
