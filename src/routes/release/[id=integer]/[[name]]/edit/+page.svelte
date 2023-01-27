<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import FormSelect from '$lib/components/form/FormSelect.svelte';
	import FormTextArea from '$lib/components/form/FormTextArea.svelte';
	import FormDate from '$lib/components/form/FormDate.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import { page } from '$app/stores';
	import { BookFormatArray } from '$lib/types/dbTypes';

	export let form: ActionData;
	export let data: PageData;
	let loading: boolean;

	let name = data.release.name;
	let nameRomaji = data.release.name_romaji;
	let isbn13 = data.release.isbn13;
	let format = data.release.format;
	let description = data.release.description;
	let releaseDate = data.release.release_date;
	let lang = data.release.lang;

	let publishers = data.release.publishers;
	let books = data.release.books;

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
	<title>Edit {data.release.name} - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Edit {data.release.name}</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success">Edited entry successfully!</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">
				Release <span class="text-sm text-gray-500 dark:text-gray-400">id{$page.params.id}</span>
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
					searchId="search-publisher-edit-release"
					fetchUrl="/api/publisher?name="
					formItemName="publisherRel"
					items={publishers}
					headerName="Publishers"
					onSearchItemClick={addPublisherToArray}
					searchPlaceholder="Search publishers..."
					error={form?.duplicatePublisherError?.message}
				/>

				<FormSearchList
					searchId="search-book-edit-release"
					fetchUrl="/api/book?name="
					formItemName="bookRel"
					items={books}
					headerName="Books"
					onSearchItemClick={addBookToArray}
					searchPlaceholder="Search books..."
					error={form?.duplicateBookError?.message}
				/>
			</div>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit Edit'} />
		</div>
	</Form>
</main>
