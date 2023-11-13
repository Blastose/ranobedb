<script lang="ts">
	import { createCombobox, melt, type ComboboxFilterFunction } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fly } from 'svelte/transition';
	import { debounce } from '$lib/util/debounce';

	interface Book {
		author: string;
		title: string;
		disabled: boolean;
	}

	let books: Book[] = [
		{
			author: 'Harper Lee',
			title: 'To Kill a Mockingbird',
			disabled: false
		},
		{
			author: 'Lev Tolstoy',
			title: 'War and Peace',
			disabled: false
		},
		{
			author: 'Fyodor Dostoyevsy',
			title: 'The Idiot',
			disabled: true
		},
		{
			author: 'Oscar Wilde',
			title: 'A Picture of Dorian Gray',
			disabled: false
		},
		{
			author: 'George Orwell',
			title: '1984',
			disabled: false
		},
		{
			author: 'Jane Austen',
			title: 'Pride and Prejudice',
			disabled: false
		},
		{
			author: 'Marcus Aurelius',
			title: 'Meditations',
			disabled: false
		},
		{
			author: 'Fyodor Dostoevsky',
			title: 'The Brothers Karamazov',
			disabled: false
		},
		{
			author: 'Lev Tolstoy',
			title: 'Anna Karenina',
			disabled: false
		},
		{
			author: 'Fyodor Dostoevsky',
			title: 'Crime and Punishment',
			disabled: false
		}
	];

	const filterFunction: ComboboxFilterFunction<Book> = (_) => {
		return true;
	};

	const updateItems = (newBooks: Book[]) => {
		books = newBooks;
	};

	const {
		elements: { menu, input, item, label },
		states: { open, isEmpty, value, inputValue },
		helpers: { isSelected }
	} = createCombobox({
		filterFunction,
		forceVisible: true,
		onValueChange: ({ curr, next }) => {
			console.log(next);
			if (next) {
				selectedItems.push(next as Book);
				selectedItems = selectedItems;
				return curr;
			}
			return undefined;
		},
		preventScroll: false
	});

	const fetchItems = async (text: string) => {
		searchState = 'fetching';
		const res = await fetch(`/api/book?name=${text}`);
		const data = (await res.json()) as {
			id: number;
			name: string;
		}[];

		const dataMapped = data.map((v) => {
			return { author: String(v.id), title: v.name, disabled: false };
		});

		updateItems(dataMapped);
		books = books;
		console.log(books);
		searchState = 'fetched';
	};
	const debouncedFetchItems = debounce(async () => {
		fetchItems(inputNode.value);
	}, 500);
	let inputNode: HTMLInputElement;
	books = [];
	let selectedItems: Book[] = [];

	let searchState: 'fetching' | 'fetched' | 'untouched' = 'untouched';
</script>

<div class="flex flex-col gap-1">
	{JSON.stringify($value)}

	{#each selectedItems as i}
		<div>
			{i.title}
		</div>
	{/each}

	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label use:melt={$label}>
		<span class="text-sm font-medium dark:text-white">Choose your favorite book:</span>
	</label>

	<div class="relative">
		<input
			on:input={() => {
				searchState = 'fetching';
				debouncedFetchItems();
			}}
			bind:this={inputNode}
			use:melt={$input}
			class="flex h-10 items-center justify-between rounded-lg bg-dark-500
          px-4 pr-12 text-white"
			placeholder="Best book ever"
		/>
		<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-slate-900">
			{#if $open}
				<Icon height="24" width="24" name="chevronLeft" />
			{:else}
				<Icon height="24" width="24" name="chevronRight" />
			{/if}
		</div>
	</div>
</div>
{#if $open && searchState !== 'untouched'}
	<ul
		class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-lg"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			class="flex max-h-full flex-col gap-0 overflow-y-auto bg-dark-500 px-2 py-2 text-white"
			tabindex="0"
		>
			{#if searchState === 'fetched'}
				{#each books as book, index (index)}
					<li
						use:melt={$item({
							value: book,
							label: book.title,
							disabled: book.disabled
						})}
						class="relative cursor-pointer scroll-my-2 rounded-md py-2 pl-4 pr-4
        data-[highlighted]:bg-dark-400 data-[highlighted]:text-white
          data-[disabled]:opacity-50"
					>
						{#if $isSelected(book)}
							<div class="check">
								<Icon height="24" width="24" name="checkCircle" />
							</div>
						{/if}
						<div>
							<span class="font-medium">{book.title}</span>
							<span class="block text-sm opacity-75">{book.author}</span>
						</div>
					</li>
				{/each}
			{/if}
			{#if searchState === 'fetching'}
				<li
					class="relative cursor-pointer rounded-md py-1 pl-8 pr-4
		data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-700"
				>
					Loading.......
				</li>
			{/if}
			{#if searchState === 'fetched' && books.length === 0}
				<li
					class="relative cursor-pointer rounded-md py-1 pl-8 pr-4
        data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-700"
				>
					No results found
				</li>
			{/if}
		</div>
	</ul>
{/if}

{#each books as book, index (index)}
	<p>{JSON.stringify(book)}</p>
{/each}
