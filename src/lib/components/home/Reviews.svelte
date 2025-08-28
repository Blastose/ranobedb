<script lang="ts">
	import type { PageProps } from '../../../routes/$types';
	import HomeReviews from '../review/HomeReviews.svelte';

	let { data }: { data: PageProps['data'] } = $props();
</script>

<HomeReviews reviews={{ reviews: data.seriesReviews, type: 'series' }} />
<HomeReviews reviews={{ reviews: data.bookReviews, type: 'book' }} />
