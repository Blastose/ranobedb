<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
</script>

<PageTitle title="Add to database" />

<main class="container-rndb flex flex-col gap-2">
	<LinkBox display="Add book" href="/books/add" />
	<LinkBox display="Add series" href="/series/add" />
	<LinkBox display="Add releases" href="/releases/add" />
	<LinkBox display="Add staff" href="/staff/add" />
	<LinkBox display="Add publisher" href="/publishers/add" />
</main>
