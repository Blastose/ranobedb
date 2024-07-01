<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Adding/editing a release" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Adding/editing a release</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>When to add a release</h2>
			<p>
				A release is an edition of a book in print, digital or audio form. A release can contain
				multiple books (like omnibus editions). Do not add any unofficial translations.
			</p>
		</section>

		<section>
			<h2>Title</h2>
			<p>The title of the release.</p>
		</section>

		<section>
			<h2>Romanization</h2>
			<p>The romanization of the title. Can be left empty.</p>
		</section>

		<section>
			<h2>Language</h2>
			<p>Lanuage that the release is in.</p>
		</section>

		<section>
			<h2>Format</h2>
			<p>One of print, digital, or audio.</p>
		</section>

		<section>
			<h2>ISBN 13</h2>
			<p>The ISBN 13 of the release. Can be left empty if the release doesn't have an ISBN.</p>
		</section>

		<section>
			<h2>Number of pages</h2>
			<p>
				The number of pages of the release. Can be left empty if the release doesn't have any pages,
				or the number of pages is unknown.
			</p>
		</section>

		<section>
			<h2>Release date</h2>
			<p>The date the release was published.</p>
		</section>

		<section>
			<h2>Links</h2>
			<section>
				<h3>Website</h3>
			</section>
			<section>
				<h3>Amazon</h3>
			</section>
			<section>
				<h3>Bookwalker</h3>
			</section>
			<section>
				<h3>Rakuten</h3>
			</section>
		</section>

		<section>
			<h2>Note</h2>
			<p>Any information that is useful.</p>
		</section>

		<section>
			<h2>Database relations</h2>

			<section>
				<h3>Books</h3>
				<p>You can add the books that the release covers.</p>
				<section>
					<h4>Type</h4>
					<p>The following types can be used:</p>
					<ul>
						<li>Complete</li>
						<li>Partial</li>
						<li>Omnibus: Might remove this one; not sure how useful it is</li>
					</ul>
				</section>
			</section>

			<section>
				<h3>Publisher</h3>
				<p>You can add the companies that were involved in the release.</p>
				<section>
					<h4>Type</h4>
					<p>The following types can be used:</p>
					<ul>
						<li>Publisher</li>
						<li>Imprint</li>
					</ul>
				</section>
			</section>
		</section>
	</div>
</main>
