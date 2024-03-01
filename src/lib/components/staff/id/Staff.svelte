<script lang="ts">
	import type { Staff } from '$lib/server/db/staff/staff';

	export let staff: Staff;
</script>

<section>
	<p class="font-medium opacity-80">Staff</p>
	<h1 class="text-2xl font-bold">{staff.name}</h1>

	<section>
		<h2>Other names</h2>

		{#each staff.aliases as alias}
			<p>{alias.name}</p>
		{:else}
			<p>No other names</p>
		{/each}
	</section>

	<p>{staff.description}</p>

	<h2 class="text-lg font-bold">Books</h2>
	{#if staff.books}
		{#each staff.books as book}
			<p><a href="/book/{book.id}">{book.title} - {book.role_type}</a></p>
		{/each}
	{/if}

	<p><a href="/staff/{staff.id}/edit">Edit</a></p>
	<p><a href="/staff/{staff.id}/history">History</a></p>
</section>
