<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReviewsUser from '$lib/components/review/ReviewsUser.svelte';

	let { data } = $props();

	let title = $derived(`${data.isMyList ? 'My' : `${data.listUser.username}'s`} book reviews`);
</script>

<PageTitle {title}></PageTitle>

<ReviewsUser
	heading={title}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	reviews={data.reviews}
	itemType="book"
	userIdNum={data.listUser.id_numeric}
/>
