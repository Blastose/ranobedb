<script lang="ts">
	import { languageNames } from '$lib/db/dbConsts';
	import type { ReleaseWithImage } from '$lib/server/db/releases/releases';
	import BookCarousel from '../book/BookCarousel.svelte';
	import BookImage from '../book/BookImage.svelte';
	import BookImageBadge from '../book/BookImageBadge.svelte';
	import { DateNumber } from '../form/release/releaseDate';

	export let releases: ReleaseWithImage[];
	export let heading: string;
</script>

<BookCarousel>
	<svelte:fragment slot="link">
		<h2 class="text-lg font-bold">{heading}</h2>
	</svelte:fragment>
	<svelte:fragment slot="items">
		{#each releases as release (release.id)}
			<div class="carousel-item">
				<BookImage
					book={{
						id: release.id,
						image: release.image,
						title: release.title,
						romaji: release.romaji,
						lang: release.lang,
					}}
					urlPrefix="/release/"
				>
					<BookImageBadge
						badges={[
							new DateNumber(release.release_date).getDateFormatted(),
							languageNames[release.lang],
							release.format,
						]}
					/>
				</BookImage>
			</div>
		{/each}
	</svelte:fragment>
</BookCarousel>
