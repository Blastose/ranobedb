<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import type { Nullish } from '$lib/server/zod/schema';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';

	export let itemType: 'book' | 'series';
	export let itemId: number;
	export let userHasReview: boolean;
	export let imageUrl: Nullish<string>;
	export let reviewSubjectTitle: string;
	export let showWriteReviewLink: boolean;
	export let singleReview: boolean;

	const theme = getThemeContext();
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
</script>

<DbRouteShell theme={$theme} {bgImageStyle}>
	<div class="flex flex-col gap-4 mt-4">
		<div>
			<h1 class="font-bold text-xl">Review{!singleReview ? 's' : ''} for {reviewSubjectTitle}</h1>
			<div class="flex flex-wrap gap-6">
				<a class="link" href="/{itemType}/{itemId}">View main {itemType} page</a>
				{#if singleReview}
					<a class="link" href="/{itemType}/{itemId}/reviews"
						>View all reviews for this {itemType}</a
					>
				{/if}
			</div>
		</div>

		{#if showWriteReviewLink}
			<a class="sub-btn w-fit flex items-center gap-2" href="/{itemType}/{itemId}/reviews/add"
				><Icon name="pencil" height="20" width="20" />{userHasReview ? 'Edit your' : 'Write a'} review</a
			>
		{/if}

		<slot />
	</div>
</DbRouteShell>
