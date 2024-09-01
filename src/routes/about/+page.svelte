<script lang="ts">
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="About us" />

<MetaTags
	title="RanobeDB"
	description="RanobeDB is a light novel database. Our mission is to provide a comprehensive database of Japanese light novels and any official translations. This website is an open, editable database and you can contribute new information or corrections to the database."
	site_name="RanobeDB"
/>

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">About us</h1>
	<div>
		<p>
			RanobeDB is a light novel database. Our mission is to provide a comprehensive database of
			Japanese light novels and any official translations.
		</p>

		<p>
			This website is an open, editable database and you can contribute new information or
			corrections to the database.
		</p>

		<p>We are currently in alpha, so expect bugs and missing features.</p>

		<p>
			If you are interested in helping out, please join our <a
				href="https://discord.gg/ZeAnhGncFx"
				class="link"
				target="_blank">Discord server</a
			>
		</p>
	</div>

	<div class="markdown">
		<section>
			<h2>Staff members</h2>
			<section>
				<h3>Admin + developer</h3>
				<p>
					<a href="/user/3">Blastose</a>
					(<a href="https://github.com/Blastose/" target="_blank">Github</a>)
				</p>
			</section>
		</section>

		<section>
			<h2>Development</h2>
			<p>See <a href="/about/development">development</a>.</p>
		</section>

		<section>
			<h2>Licensing</h2>
			<p>
				All information on RanobeDB is available under the <a
					href="https://opendatacommons.org/licenses/odbl/1-0/"
					target="_blank">Open Database License</a
				>
				and its contents are licensed under the
				<a href="https://opendatacommons.org/licenses/dbcl/1-0/" target="_blank"
					>Database Contents License</a
				>.
			</p>
			<p>
				The <a href="https://github.com/Blastose/ranobedb" target="_blank">source code</a> is
				licensed under
				<a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank">AGPL-3.0</a>.
			</p>
		</section>

		<section>
			<h2>Special thanks</h2>
			<p>RanobeDB wouldn't be possible without any of the following:</p>
			<ul>
				<li>
					<a href="https://vndb.org/" target="_blank">vndb</a> for inspiring and influencing this project
				</li>
				<li>
					<a href="https://github.com/LNRelease/lnrelease.github.io" target="_blank">LNRelease</a> for
					compiling a list of English light novels
				</li>
				<li>
					<a href="https://ranobe-mori.net/" target="_blank">Ranobe Mori</a> for compiling a list of
					Japanese light novels
				</li>
			</ul>
		</section>
	</div>
</main>
