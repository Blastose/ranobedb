<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
</script>

<PageTitle title="Add to database" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">Add to database</h1>

	<p>
		Make sure you read the <a href="/editing-guidelines" class="link">editing guidelines</a> before you
		add anything to the database.
	</p>

	<div class="flex flex-col gap-2">
		<LinkBox display="Add book" href="/books/add" />
		<LinkBox display="Add series" href="/series/add" />
		<LinkBox display="Add release" href="/releases/add" />
		<LinkBox display="Add staff" href="/staff/add" />
		<LinkBox display="Add publisher" href="/publishers/add" />
	</div>
</main>
