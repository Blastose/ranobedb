<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { BookR } from '$lib/server/db/books/books';
	import ReleaseOptions from './ReleaseOptions.svelte';
	import ReleaseLinks from './ReleaseLinks.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { Infer } from 'sveltekit-superforms/server';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';

	export let release: BookR['releases'][number];
	export let userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined;

	$: releaseDate = new DateNumber(release.release_date).getDateFormatted();

	const size = '24';
</script>

<div class="grid grid-cols-[86px_1fr] gap-x-2">
	<time datetime={releaseDate}>{releaseDate}</time>

	<div class="flex justify-between items-start">
		<a class="link" href="/release/{release.id}"><NameDisplay obj={release} /></a>

		<div class="flex gap-2 whitespace-nowrap">
			<div title={release.format}>
				{#if release.format === 'print'}
					<Icon name="bookW" height={size} width={size} />
				{:else if release.format === 'digital'}
					<Icon name="laptop" height={size} width={size} />
				{:else if release.format === 'audio'}
					<Icon name="headphones" height={size} width={size} />
				{/if}
			</div>

			{#if userListReleaseForm}
				<ReleaseOptions {release} {userListReleaseForm} />
			{/if}
			<ReleaseLinks {release} />
		</div>
	</div>
</div>
