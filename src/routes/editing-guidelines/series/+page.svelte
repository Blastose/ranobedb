<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Adding/editing a series" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Adding/editing a series</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>What can be added</h2>
			<p>
				Only Japanese series or series that are considered light novels and have a Japanese release
				can be added to the database.
				<br />
				Exceptions: Japanese web novels that are translated to English and published as a book can be
				included.
			</p>
		</section>

		<section>
			<h2>Titles</h2>
			<p>
				A title for each language can be added to a series. Use only official titles from the
				publisher; do not use fan translated titles.
				<br />
				Romanize the title if it needs to be romanized, and leave the field blank if it doesn't.
			</p>
		</section>

		<section>
			<h2>Aliases</h2>
			<p>
				Add any names the series is known as in this field, separated by new lines. For example,
				'Oregairu' for the series ' My Youth Romantic Comedy Is Wrong, As I Expected'.
			</p>
		</section>

		<section>
			<h2>Note</h2>
			<p>
				Any information that is useful. For example, for a cancelled series, where the series left
				off in the web novel like in <a href="/series/13691/revision/4"
					>https://ranobedb.org/series/13691/revision/4</a
				>
			</p>
		</section>

		<section>
			<h2>Publication status</h2>
			<p>The publication status of the series can be one of the following:</p>
			<ul>
				<li>Ongoing</li>
				<li>Completed</li>
				<li>Hiatus</li>
				<li>Cancelled</li>
				<li>Unknown</li>
			</ul>
		</section>

		<section>
			<h2>Language</h2>
			<p>
				Lanuage that the book was originally written in. You should only add books that were
				originally written in Japanese, so this field should always be Japanese.
			</p>
		</section>

		<section>
			<h2>Start date</h2>
			<p>The date the first book in the series was published.</p>
		</section>

		<section>
			<h2>End date</h2>
			<p>The date the last book in the series was published and the series is completed.</p>
		</section>

		<section>
			<h2>Links</h2>
			<section>
				<h3>Web novel</h3>
				<p>A link to Syosetu or Kakuyomu.</p>
			</section>
			<section>
				<h3>AniDB id</h3>
				<p>If the series has an anime, the id of the anime.</p>
			</section>
			<section>
				<h3>Bookwalker id</h3>
				<p>The Bookwalker id.</p>
			</section>
			<section>
				<h3>Wikidata id</h3>
				<p>The Wikidata id.</p>
			</section>
		</section>

		<section>
			<h2>Database relations</h2>

			<section>
				<h3>Books</h3>
				<p>You can create editions and add staff to them.</p>
				<section>
					<h4>Book type</h4>
					<p>The following types can be used:</p>
					<ul>
						<li>Main</li>
						<li>Sub</li>
					</ul>
				</section>
				<section>
					<h4>Sort order</h4>
					<p>
						You can reorder books in the series. The order should be based on the release order of
						the books in the series.
					</p>
				</section>
			</section>

			<section>
				<h3>Series</h3>
				<p>
					You can create relations between other series. You do not need to edit the other series
					manually; we will automatically create an edit with the corresponding relation for the
					other series.
				</p>
				<section>
					<h4>Relation type</h4>
					<p>The following types can be used:</p>
					<ul>
						<li>Parent story: Corresponds to spin-off</li>
						<li>Prequel: Corresponds to sequel</li>
						<li>Sequel: Corresponds to prequel</li>
						<li>Side story: Corresponds to main story</li>
						<li>Main story: Corresponds to side story</li>
						<li>Spin-off: Corresponds to parent story</li>
					</ul>
				</section>
			</section>
		</section>
	</div>
</main>
