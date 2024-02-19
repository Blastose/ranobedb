<script lang="ts">
	export let data;

	$: changes = data.changes;
</script>

<div class="container-rndb">
	<h1>Edit history of "TODO Book title here"</h1>

	<div>
		{#each changes as change}
			<p>
				<a href="/book/{change.item_id}/rev/{change.revision}"
					>rev.b.{change.item_id}.r.{change.revision} - {change.added} - {change.user_id} - {change.comments}</a
				>
			</p>
		{/each}
	</div>
</div>
