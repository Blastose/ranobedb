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

<a href="/publisher/{publisher.id}/edit">Edit</a>
<a href="/publisher/{publisher.id}/history">History</a>
