<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Adding/editing a publisher" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Adding/editing a publisher</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>When to add a publisher</h2>
			<p>
				Add a publisher when it is needed for a release, or when needed to add a relation for
				another publisher.
			</p>
		</section>

		<section>
			<h2>Name</h2>
			<p>The name of the publisher in their original script.</p>
		</section>

		<section>
			<h2>Romanization</h2>
			<p>The romanization of the publisher's name. Can be left empty.</p>
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
		</section>

		<section>
			<h2>Biography</h2>
			<p>A history of the publisher.</p>
		</section>

		<section>
			<h2>Database relations</h2>

			<section>
				<h3>Publisher</h3>
				<p>
					You can create relations between other publishers. You do not need to edit the other
					publisher manually; we will automatically create an edit with the corresponding relation
					for the other publisher.
				</p>
				<section>
					<h4>Relation type</h4>
					<p>The following types can be used:</p>
					<ul>
						<li>Imprint: Corresponds to parent brand</li>
						<li>Parent brand: Corresponds to imprint</li>
						<li>Parent company: Corresponds to subsidiary</li>
						<li>Subsidiary: Corresponds to parent company</li>
					</ul>
				</section>
			</section>
		</section>
	</div>
</main>
