<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Editing guidelines" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">Editing guidelines</h1>

	<div class="markdown flex flex-col gap-2">
		<section>
			<h2>General guidelines</h2>

			<section>
				<h3>Romanization</h3>
				<p>
					Romanization is applied to many fields in the database (titles, names, etc.). Use modified
					Hepburn when romanizing Japanese titles. You can use <a
						href="https://wiki.anidb.net/AniDB_Definition:Romanisation"
						target="_blank">AniDB's romanization guidelines</a
					> as a reference.
				</p>
			</section>

			<section>
				<h3>Name order</h3>
				<p>
					Use the name order that is normally used for the name. For example, 川原礫 is Kawahara
					Reki (family name, then given name) and not Reki Kawahara (given name, then family name).
				</p>
			</section>

			<section>
				<h3>Edit summary</h3>
				<p>
					Use this field to give a brief summary of the changes made, and explain any of the
					decisions made for future contributors to reference. Include any sources you have taken
					into account when you made your changes so others can reference them.
				</p>
			</section>

			<section>
				<h3>Descriptions from external sources</h3>
				<p>
					You can use descriptions from external sources as long as you credit them properly. You
					can link to the source using Markdown like so:
					<code>[From [<em>source</em>](<em>url</em>)]</code>
					<br />
					Do not include the url if it links to websites that provide illegal downloads or unofficial
					translations.
				</p>
			</section>

			<section>
				<h3>Do not include or link to any unofficial translations</h3>
				<p>
					Do not add any unofficial translations to the database or link to any unofficial
					translations.
				</p>
			</section>

			<section>
				<h3>Do not use machine translation</h3>
				<p>Do not use machine translation for any of the fields.</p>
			</section>
		</section>

		<Hr />

		<section>
			<h2>Item specific guidelines</h2>

			<nav>
				<ul>
					<li><a href="/editing-guidelines/books">Books guidelines</a></li>
					<li><a href="/editing-guidelines/series">Series guidelines</a></li>
					<li><a href="/editing-guidelines/releases">Releases guidelines</a></li>
					<li><a href="/editing-guidelines/staff">Staff guidelines</a></li>
					<li><a href="/editing-guidelines/publishers">Publishers guidelines</a></li>
				</ul>
			</nav>
		</section>
	</div>
</main>
