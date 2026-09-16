<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import { languageNames } from '$lib/db/dbConsts';
	import type { Release } from '$lib/server/db/releases/releases';
	import type { User } from '$lib/server/lucia/lucia';
	import { formatDuration } from '$lib/utils/duration';
	import {
		getDisplayPrefsContext,
		getReleaseTitleDisplay,
		getReleaseTitleDisplaySub,
	} from '$lib/display/prefs';
	import Cover from '$lib/components/image/Cover.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import ReleaseOptions from '$lib/components/book/id/ReleaseOptions.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';
	import ReadingListBadge from '$lib/components/book/ReadingListBadge.svelte';
	import LangFlag from '$lib/components/titles/LangFlag.svelte';
	import { hasEditPerms } from '$lib/db/permissions';

	interface Props {
		release: Release;
		revision: number | undefined;
		user: User | null;
		userListReleaseForm?: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined;
	}

	let { release, revision, user, userListReleaseForm = undefined }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();
</script>

{#snippet metadata()}
	{#if userListReleaseForm !== undefined}
		<dl>
			<div>
				<dt>List status</dt>
				<dd>
					<ReleaseOptions
						{release}
						{userListReleaseForm}
						showStatus={true}
						side="bottom"
						align="start"
					/>
				</dd>
			</div>
		</dl>
	{/if}

	<dl>
		<div>
			<dt>Released</dt>
			<dd>{new DateNumber(release.release_date).getDateFormatted()}</dd>
		</div>
		<div>
			<dt>Language</dt>
			<dd class="flex items-center gap-2">
				<LangFlag lang={release.lang} />
				{languageNames[release.lang]}
			</dd>
		</div>
		<div>
			<dt>Format</dt>
			<dd class="flex items-center gap-1.5 capitalize">
				{#if release.format === 'print'}
					<Icon name="bookW" height="24" width="24" />
				{:else if release.format === 'digital'}
					<Icon name="laptop" height="24" width="24" />
				{:else if release.format === 'audio'}
					<Icon name="headphones" height="24" width="24" />
				{/if}
				{release.format}
			</dd>
		</div>

		{#if release.format === 'audio' && release.duration}
			<div>
				<dt>Duration</dt>
				<dd>{formatDuration(release.duration)}</dd>
			</div>
		{/if}
		{#if release.format !== 'audio' && release.pages}
			<div>
				<dt>Pages</dt>
				<dd>{release.pages}</dd>
			</div>
		{/if}

		{#if release.isbn13}
			<div>
				<dt>ISBN13</dt>
				<dd>{release.isbn13}</dd>
			</div>
		{/if}
	</dl>

	{#if release.description}
		<section>
			<h2 class="font-bold">Note</h2>
			<MarkdownToHtml markdown={release.description} type="full" />
		</section>
	{/if}

	<section class="flex flex-col gap-1">
		<h2 class="text-lg font-bold">Links</h2>
		{#if release.website || release.amazon || release.bookwalker || release.rakuten}
			<div class="flex flex-wrap gap-x-2 gap-y-2">
				{#if release.website}
					<DbExtLinkShort href={release.website} name="Website" />
				{/if}
				{#if release.amazon}
					<DbExtLinkShort href={release.amazon} name="Amazon" />
				{/if}
				{#if release.bookwalker}
					<DbExtLinkShort href={release.bookwalker} name="BookWalker" />
				{/if}
				{#if release.rakuten}
					<DbExtLinkShort href={release.rakuten} name="Rakuten" />
				{/if}
			</div>
		{:else}
			<p class="italic">No links added</p>
		{/if}
	</section>

	{#if release.isbn13}
		<section class="flex flex-col gap-1">
			<h2 class="text-lg font-bold">ISBN lookup</h2>
			<div>
				{#if release.lang === 'ja'}
					<DbExtLinkShort
						href="https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E6%96%87%E7%8C%AE%E8%B3%87%E6%96%99?isbn={release.isbn13}"
						name="Wikipedia book sources"
					/>
				{:else}
					<DbExtLinkShort
						href="https://en.wikipedia.org/wiki/Special:BookSources?isbn={release.isbn13}"
						name="Wikipedia book sources"
					/>
				{/if}
			</div>
		</section>
	{/if}

	{#if release.publishers.length > 0}
		<section>
			<h2 class="text-lg font-bold">Publishers</h2>
			<p>
				{#each release.publishers as publisher, index (`${publisher.id}|${publisher.publisher_type}`)}
					<span>
						<a class="link" href="/publisher/{publisher.id}"><NameDisplay obj={publisher} /></a>
						<span class="text-xs">{publisher.publisher_type}</span
						>{#if index !== release.publishers.length - 1}<span>, {' '}</span>{/if}
					</span>
				{/each}
			</p>
		</section>
	{/if}
{/snippet}

<DBItemShell
	dbItem="release"
	{revision}
	name={getReleaseTitleDisplay({ obj: release, prefs: $displayPrefs })}
	subName={getReleaseTitleDisplaySub({ obj: release, prefs: $displayPrefs })}
	{user}
	item={release}
	copyTo={{ to: ['book'] }}
>
	<div class="flex flex-col gap-2">
		{#if release.image}
			<div class="grid grid-cols-1 gap-4 @sm:grid-cols-[168px_1fr] @md:grid-cols-[180px_1fr]">
				<div class="flex w-full max-w-48 flex-col gap-4 @sm:max-w-full">
					{#key release.image.id}
						<Cover image={release.image} revealable={true}>
							{#if hasEditPerms(user) && revision === undefined}
								<a
									href="/image/{release.image.id}"
									class="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
								>
									Edit image
								</a>
							{/if}
						</Cover>
					{/key}
				</div>
				<div class="flex flex-col gap-2">
					{@render metadata()}
				</div>
			</div>
		{:else}
			{@render metadata()}
		{/if}
	</div>

	<section class="mt-2 flex flex-col gap-1">
		<h2 class="text-lg font-bold">Book relations</h2>

		{#if release.books.length > 0}
			<div class="grid grid-cols-1 gap-2 @md:grid-cols-2 @lg:grid-cols-3">
				{#each release.books as book (book.id)}
					<a href="/book/{book.id}" class="link-box flex items-start gap-2 p-2 shadow-sm">
						<div class="w-12 shrink-0 sm:w-[72px]">
							<Cover image={book.image} useDefaultCoverAspectRatio={true} />
						</div>
						<div class="flex min-w-0 flex-col gap-1">
							<span class="line-clamp-3 text-sm font-bold sm:text-base">
								<TitleDisplay obj={book} />
							</span>
							<div class="flex flex-col gap-1">
								{#if book.label}
									<ReadingListBadge badge={book.label.label} textSize="compact" />
								{/if}
								{#if book.rtype && book.rtype === 'partial'}
									<span
										class="w-fit rounded-full bg-[var(--primary-300)] px-2 py-0.5 text-xs capitalize dark:bg-[var(--dark-400)]"
										>{book.rtype}</span
									>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="italic">None</p>
		{/if}
	</section>
</DBItemShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 100px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
