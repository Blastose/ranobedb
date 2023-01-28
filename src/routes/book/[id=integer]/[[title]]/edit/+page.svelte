<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormMarkdownEditor from '$lib/components/form/FormMarkdownEditor.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import FormSearchList from '$lib/components/form/FormSearchList.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';
	import BackButton from '$lib/components/back-button/BackButton.svelte';
	import type { RoleType } from '$lib/types/dbTypes';
	import { PersonRoles } from '$lib/types/dbTypes';
	import { page } from '$app/stores';

	type Person = {
		id: number;
		name: string;
		role: RoleType;
	};

	export let form: ActionData;
	export let data: PageData;
	let loading: boolean;
	let title = data.book.title ?? '';
	let titleRomaji = data.book.title_romaji ?? '';
	let description = data.book.description_markdown ?? '';
	let volume = data.book.volume;
	let people = data.book.people;

	const addPersonToArray = (person: Omit<Person, 'role'>) => {
		people.push({ ...person, role: 'artist' });
		people = people;
	};
</script>

<svelte:head>
	<title>Edit {data.book.title} - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<BackButton />
		<h1 class="font-bold text-2xl">Edit</h1>
	</div>

	{#if form?.success && !loading}
		<Alert type="success">Edited entry successfully!</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">{form?.error.message ?? 'An error has occurred.'}</Alert>
	{/if}

	<Form bind:loading reset={false} scrollToTop={true}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">
				Book <span class="text-sm text-gray-500 dark:text-gray-400">id{$page.params.id}</span>
			</h2>

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
					searchId="search-people-edit-book"
					dropdown={{ itemAttribute: 'role', dropdownValues: PersonRoles }}
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
			<FormSubmitButton {loading} text={'Submit Edit'} />
		</div>
	</Form>
</main>
