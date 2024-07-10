<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Adding/editing a book" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Adding/editing a book</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>What can be added</h2>
			<p>
				Only Japanese books or books that are considered light novels and have a Japanese release
				can be added to the database.
				<br />
				Exceptions: Japanese web novels that are translated to English and published as a book can be
				included.
			</p>
		</section>

		<section>
			<h2>Titles</h2>
			<p>
				A title for each language can be added to a book. Use only official titles from the
				publisher; do not use fan translated titles. Some books contain an English title; do not use
				these are they often have poor English; you can add those to the aliases field in series
				instead.
				<br />
				Romanize the title if it needs to be romanized, and leave the field blank if it doesn't.
			</p>
		</section>

		<section>
			<h2>Description</h2>
			<p>
				A short description of the book. Use descriptions provided by the English publisher if
				available.
			</p>
		</section>

		<section>
			<h2>Description (Japanese)</h2>
			<p>
				A short description of the book in Japanese. Use descriptions provided by the Japanese
				publisher.
			</p>
		</section>

		<section>
			<h2>Language</h2>
			<p>
				Lanuage that the book was originally written in. You should only add books that were
				originally written in Japanese, so this field should always be Japanese.
			</p>
		</section>

		<section>
			<h2>Release date</h2>
			<p>
				The date the book was originally released.
				<br />
				This field may be removed in the future, since we may be able to get the release date from the
				book's releases instead.
			</p>
		</section>

		<section>
			<h2>Database relations</h2>

			<section>
				<h3>Editions and staff</h3>
				<p>You can create editions and add staff to them.</p>
				<section>
					<h4>Staff</h4>
					<p>
						You can add the staff member that worked on the book. Use the staff alias that is
						credited in the book.
					</p>
					<p>The following roles can be used for a staff member:</p>
					<ul>
						<li>Author</li>
						<li>Artist</li>
						<li>Editor</li>
						<li>
							Staff: Used when the other roles do not apply. Use the note field to specify their
							role.
						</li>
						<li>Translator</li>
						<li>Narrator</li>
					</ul>
				</section>
				<section>
					<h4>Editions</h4>
					<p>
						Editions are used to group staff members. Each book has an original edition, and other
						editions may be added if the staff members change. Add an edition for each translation
						of a book.
					</p>
				</section>
			</section>
		</section>
	</div>
</main>
