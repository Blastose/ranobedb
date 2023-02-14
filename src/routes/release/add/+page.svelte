<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import FormSelect from '$lib/components/form/FormSelect.svelte';
	import FormTextArea from '$lib/components/form/FormTextArea.svelte';
	import FormDate from '$lib/components/form/FormDate.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import { BookFormatArray } from '$lib/types/dbTypes';

	export let form: ActionData;

	type ReleaseRelation = { id: number; name: string };
	let loading: boolean;

	let name = '';
	let nameRomaji = '';
	let isbn13 = '';
	let format = '';
	let description = '';
	let releaseDate = '';
	let lang = '';

	let publishers: ReleaseRelation[] = [];
	let books: ReleaseRelation[] = [];

	const formBookFormat = BookFormatArray.map((item) => {
		return { value: item, name: item };
	});

	const addPublisherToArray = (publisher: { id: number; name: string }) => {
		if (publishers.map((b) => b.id).indexOf(publisher.id) !== -1) return;
		publishers.push(publisher);
		publishers = publishers;
	};

	const addBookToArray = (book: { id: number; name: string }) => {
		if (books.map((b) => b.id).indexOf(book.id) !== -1) return;
		books.push(book);
		books = books;
	};
</script>

<svelte:head>
	<title>Add Release- RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Add release</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success"
			>Added release successfully! <a
				href="/release/{form?.addedReleaseId}"
				class="text-blue-800 hover:underline"
				>Find the release at /release/{form?.addedReleaseId}.</a
			></Alert
		>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Release</h2>

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

			<FormInput
				bind:value={isbn13}
				name="isbn13"
				id="isbn13"
				type="text"
				labelName="ISBN-13"
				placeholder="ISBN-13"
				error={form?.isbn13Error?.message}
			/>

			<FormTextArea
				bind:value={description}
				name="description"
				placeholder="Add description..."
				labelName="Description"
				id="description"
				error={form?.descriptionError?.message}
			/>

			<FormDate
				bind:value={releaseDate}
				id="releaseDate"
				labelName="Release date"
				name="releaseDate"
			/>

			<FormSelect
				name="format"
				id="format"
				labelName="Format"
				options={formBookFormat}
				selectedValue={format}
			/>

			<FormSelect
				name="lang"
				id="lang"
				labelName="Language"
				options={[
					{ name: 'Japanese', value: 'jp' },
					{ name: 'English', value: 'en' }
				]}
				selectedValue={lang}
			/>

			<div class="flex flex-col gap-2">
				<h2 class="font-bold text-xl">Database Relations</h2>
				<FormSearchList
					searchId="search-publisher-add-release"
					fetchUrl="/api/publisher?name="
					formItemName="publisherRel"
					items={publishers}
					headerName="Publishers"
					onSearchItemClick={addPublisherToArray}
					searchPlaceholder="Search publishers..."
					baseUrl="publisher"
					error={form?.duplicatePublisherError?.message}
				/>

				<FormSearchList
					searchId="search-book-add-release"
					fetchUrl="/api/book?name="
					formItemName="bookRel"
					items={books}
					headerName="Books"
					onSearchItemClick={addBookToArray}
					searchPlaceholder="Search books..."
					baseUrl="book"
					error={form?.duplicateBookError?.message}
				/>
			</div>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit'} />
		</div>
	</Form>
</main>
