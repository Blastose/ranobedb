<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Database Dumps" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">Database Dumps</h1>

	<div class="markdown">
		<section>
			<p>RanobeDB's database is built using PostgreSQL.</p>
			<p>
				These database dumps are generated using <code>pg_dump</code>'s plain-text format and then
				compressed with gzip. You can use
				<code>psql</code> to restore the database. Once restored, you can connect to your PostgreSQL
				database and start querying the data.
			</p>
			<p>These dumps contain almost everything in RanobeDB, expect for the following:</p>
			<ul>
				<li>Change histories of database entries</li>
				<li>Anything related to users' lists</li>
			</ul>

			<p>
				RanobeDB also has an <a href="/api/docs/v0/">API</a> if you prefer programmatic access to our
				data without downloading the full dump.
			</p>
		</section>

		<section>
			<h2>Schema</h2>
			<p>
				For more information, you can view the full schema on <a
					href="https://github.com/Blastose/ranobedb/blob/main/sql/schema.sql"
					target="_blank">Github</a
				>.
			</p>
			<p>
				Since the database dumps do not contain everything on RanobeDB, you can ignore the tables in
				the above schema that aren't included in the dumps.
				<br />
				The database dumps are not stable APIs. The schema may change over time.
			</p>
		</section>

		<section>
			<h2>License</h2>
			<p>
				RanobeDB is made available under the <a
					href="https://opendatacommons.org/licenses/odbl/1-0/"
					target="_blank">Open Database License</a
				>. Any rights in individual contents of the database are licensed under the
				<a href="https://opendatacommons.org/licenses/dbcl/1-0/" target="_blank"
					>Database Contents License</a
				>.
			</p>
		</section>

		<section>
			<h2>Download</h2>
			<p>The database dumps are created once a day at 12:00 AM UTC+00:00.</p>
			<p>
				Download the database: <a
					class="link"
					href="https://dumps.ranobedb.org/rndb-db-public-latest.dump.gz"
					download>rndb-db-public-latest.dump.gz</a
				>
			</p>
			<p>
				The past 7 days of database dumps are also available with the following link format:
				<br />
				<code>{'https://dumps.ranobedb.org/rndb-db-public-{2025-01-01}.dump.gz'}</code>
			</p>
		</section>
	</div>
</main>
