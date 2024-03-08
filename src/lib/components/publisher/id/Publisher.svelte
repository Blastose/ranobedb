<script lang="ts">
	import type { Publisher } from '$lib/server/db/publishers/publishers';

	export let publisher: Publisher;
</script>

<p>Publisher</p>
<h1 class="text-2xl font-bold">{publisher.name}</h1>

<h2 class="text-lg font-bold">Releases</h2>
{#each publisher.releases as release}
	<p><a href="/release/{release.id}">{release.title} - {release.release_date}</a></p>
{/each}

<!-- <section>
	<h2>parent_publisher</h2>
	{#each publisher.parent_publishers as parent_publisher}
		<p>
			<a href="/publisher/{parent_publisher.id}"
				>{parent_publisher.name} as {parent_publisher.relation_type}</a
			>
		</p>
	{/each}
</section> -->

<section>
	<h2>child_publishers</h2>
	{#each publisher.child_publishers as child_publishers}
		<p>
			<a href="/publisher/{child_publishers.id}"
				>{child_publishers.name} as {child_publishers.relation_type}</a
			>
		</p>
	{/each}
</section>

<a href="/publisher/{publisher.id}/edit">Edit</a>
<a href="/publisher/{publisher.id}/history">History</a>
