<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Adding/editing a staff" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Adding/editing a staff</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>Names</h2>
			<p>
				A staff member can have multiple names they have worked under (e.g. abec and BUNBUN). You
				can add multiple aliases to a staff member, and pick their primary name.
			</p>
		</section>

		<section>
			<h2>Links</h2>
			<section>
				<h3>Website</h3>
			</section>
			<section>
				<h3>Bookwalker</h3>
			</section>
			<section>
				<h3>Wikidata</h3>
			</section>
			<section>
				<h3>Twitter</h3>
			</section>
			<section>
				<h3>Pixiv</h3>
			</section>
		</section>

		<section>
			<h2>Biography</h2>
			<p>
				A biography of the staff. You can add links that do not correspond to the above link fields.
			</p>
		</section>
	</div>
</main>
