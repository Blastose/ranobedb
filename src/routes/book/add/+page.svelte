<script lang="ts">
	import type { ActionData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormMarkdownEditor from '$lib/components/form/FormMarkdownEditor.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import type { RoleType } from '$lib/types/dbTypes';
	import { PersonRolesArray } from '$lib/types/dbTypes';

	type Person = {
		id: number;
		name: string;
		role: RoleType;
	};

	export let form: ActionData;
	let loading: boolean;
	let title = '';
	let titleRomaji = '';
	let description = '';
	let volume = '';
	let people: Person[] = [];

	const addPersonToArray = (person: Omit<Person, 'role'>) => {
		people.push({ ...person, role: 'artist' });
		people = people;
	};
</script>

<svelte:head>
	<title>Add Book - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Add book</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success">
			<p>
				Added book successfully! <a
					href="/book/{form?.addedBookId}"
					class="text-blue-800 hover:underline">Find the book at /book/{form?.addedBookId}.</a
				>
			</p>
		</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Book</h2>

			<FormInput
				bind:value={title}
				name="title"
				id="title"
				type="text"
				labelName="Title"
				required={true}
				placeholder="Title"
				error={form?.titleError?.message ?? ''}
			/>

			<FormInput
				bind:value={titleRomaji}
				name="titleRomaji"
				id="titleRomaji"
				type="text"
				labelName="Title Romaji"
				required={true}
				placeholder="Title Romaji"
				error={form?.titleRomajiError?.message ?? ''}
			/>

			<FormMarkdownEditor
				bind:text={description}
				formIdName="description"
				formLabel="Description"
				placeholder="Add description..."
				error={form?.description?.message ?? ''}
			/>

			<FormInput
				bind:value={volume}
				name="volume"
				id="volume"
				type="text"
				labelName="Volume"
				required={true}
				placeholder="Volume"
				error={form?.volumeError?.message ?? ''}
			/>

			<div class="flex flex-col gap-2">
				<h2 class="font-bold text-xl">Database Relations</h2>
				<FormSearchList
					searchId="search-people-add-book"
					dropdown={{ itemAttribute: 'role', dropdownValues: PersonRolesArray }}
					fetchUrl="/api/person?name="
					formItemName="person"
					items={people}
					headerName="People"
					onSearchItemClick={addPersonToArray}
					searchPlaceholder="Search people..."
					baseUrl="person"
					error={form?.duplicatePersonsError?.message ?? ''}
				/>
			</div>
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit'} />
		</div>
	</Form>
</main>
