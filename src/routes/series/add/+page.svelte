<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';

	export let form: ActionData;

	let loading: boolean;
	let title = '';
	let titleRomaji = '';
	let books: Book[] = [];

	type Book = { id: number; name: string };

	const addBookToArray = (book: Book) => {
		if (books.map((b) => b.id).indexOf(book.id) !== -1) return;
		books.push(book);
		books = books;
	};
</script>

<svelte:head>
	<title>Add Series - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-start gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Add Series</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success"
			>Added series successfully! <a
				href="/series/{form?.addedSeriesId}"
				class="text-blue-800 hover:underline">Find the series at /series/{form?.addedSeriesId}.</a
			></Alert
		>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Series</h2>

			<FormInput
				bind:value={title}
				name="title"
				id="title"
				type="text"
				labelName="Title"
				required={true}
				placeholder="Title"
			/>

			<FormInput
				bind:value={titleRomaji}
				name="titleRomaji"
				id="titleRomaji"
				type="text"
				labelName="Title Romaji"
				placeholder="Title Romaji"
			/>

			<div class="flex flex-col gap-2">
				<h2 class="font-bold text-xl">Database Relations</h2>
				<FormSearchList
					searchId="search-book-add-series"
					fetchUrl="/api/book?name="
					formItemName="booksInSeries"
					items={books}
					headerName="Books in series"
					onSearchItemClick={addBookToArray}
					searchPlaceholder="Search books..."
					baseUrl="book"
					error={''}
				/>
			</div>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit'} />
		</div>
	</Form>
</main>
