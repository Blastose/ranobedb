<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();
</script>

<section aria-labelledby={id}>
	<SectionHeading level={3} {id} label="Field notes" />
	<ul class="field-notes">
		<li>
			<strong>Pagination.</strong> List endpoints return <code>count</code>,
			<code>currentPage</code> and <code>totalPages</code> (<code>count</code> divided by the page
			size, rounded up). <code>page</code> starts at <code>1</code>. <code>limit</code> defaults to
			<code>24</code> with a maximum of <code>100</code>; <code>/tags</code> always returns 24 per page.
		</li>
		<li>
			<strong>Counts.</strong> The top-level <code>count</code> of a list is a string such as
			<code>"55627"</code>, and so is <code>count</code> on each tag. Counts nested inside an entry,
			such as <code>volumes.count</code> on a series in a list, are numbers.
		</li>
		<li>
			<strong>Dates are numbers.</strong> Fields such as <code>c_release_date</code>,
			<code>release_date</code>, <code>start_date</code> and <code>end_date</code> are
			<code>YYYYMMDD</code> integers. A <code>99</code> in the month or day position means that part
			is unknown, so <code>20080899</code> is a release in 2008-08 with no known day. A year of
			<code>9999</code> means to be announced, or ongoing for an end date.
		</li>
		<li>
			<strong>Images.</strong> An <code>image</code> object gives the file's
			<code>filename</code>, <code>width</code> and <code>height</code>, plus <code>nsfw</code> and
			<code>spoiler</code> flags, and is <code>null</code> when there is no image. The site builds
			the image URL from its image host address followed by the <code>filename</code>.
		</li>
		<li>
			<strong>Hidden and locked.</strong> The single-entry endpoints return <code>404</code> for
			hidden entries, so <code>hidden</code> is always <code>false</code> there.
			<code>locked</code> marks an entry that regular users cannot edit on the site.
		</li>
		<li>
			<strong>Relevance score.</strong> When <code>q</code> is set, list entries can include a
			<code>sim_score</code> number used for the relevance ordering. Books, series and releases only
			include it when <code>sort</code> is a <code>Relevance</code> option.
		</li>
	</ul>
</section>

<style>
	.field-notes {
		max-width: 70ch;
		padding-left: 1.25rem;
		list-style: disc;
	}

	.field-notes li {
		margin: 0.375rem 0;
	}
</style>
