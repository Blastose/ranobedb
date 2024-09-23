<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { BookOne } from '$lib/server/db/books/books';
	import ReleaseOptions from './ReleaseOptions.svelte';
	import ReleaseLinks from './ReleaseLinks.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { Infer } from 'sveltekit-superforms/server';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';

	export let release: BookOne['releases'][number];
	export let userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined;
	export let showLang: boolean = false;
	export let showMenus: boolean = true;

	$: releaseDate = new DateNumber(release.release_date).getDateFormatted();

	const size = '24';
</script>

<div class="flex flex-col sm:grid sm:grid-cols-[92px_1fr] gap-x-2">
	<time datetime={releaseDate}>{releaseDate}</time>

	<div class="flex justify-between items-start">
		<div class="flex gap-2">
			<div title={release.format}>
				{#if release.format === 'print'}
					<Icon name="bookW" height={size} width={size} />
				{:else if release.format === 'digital'}
					<Icon name="laptop" height={size} width={size} />
				{:else if release.format === 'audio'}
					<Icon name="headphones" height={size} width={size} />
				{/if}
			</div>
			{#if showLang}
				<p class="whitespace-nowrap">{release.lang}</p>
			{/if}
			<a class="link" href="/release/{release.id}"><NameDisplay obj={release} /></a>
		</div>

		{#if showMenus}
			<div class="flex gap-2 whitespace-nowrap">
				{#if userListReleaseForm}
					<ReleaseOptions {release} {userListReleaseForm} />
				{/if}
				<ReleaseLinks {release} />
			</div>
		{/if}
	</div>
</div>
