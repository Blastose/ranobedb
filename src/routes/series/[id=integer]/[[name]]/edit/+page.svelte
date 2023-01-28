<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import { page } from '$app/stores';

	export let form: ActionData;
	export let data: PageData;
	let loading: boolean;
	let title = data.series.title ?? '';
	let titleRomaji = data.series.title_romaji ?? '';
	let books = data.series.books_in_series;

	const addBookToArray = (book: { id: number; name: string }) => {
		if (books.map((b) => b.id).indexOf(book.id) !== -1) return;
		books.push(book);
		books = books;
	};
</script>

<svelte:head>
	<title>Edit {data.series.title} - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-start gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Edit {data.series.title}</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success">Edited entry successfully!</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">
				Series <span class="text-sm text-gray-500 dark:text-gray-400">id{$page.params.id}</span>
			</h2>

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
					searchId="search-book-edit-series"
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
			<FormSubmitButton {loading} text={'Submit Edit'} />
		</div>
	</Form>
</main>
