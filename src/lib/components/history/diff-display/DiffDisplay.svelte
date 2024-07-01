<script lang="ts">
	import type { Diff } from '../utils';
	import DiffSection from './DiffSection.svelte';

	export let changes: Diff;
</script>

<section>
	<h3 class="font-semibold">{changes.name}</h3>
	<div class="grid grid-cols-2 gap-1 sm:gap-2">
		<div>
			<DiffSection {changes} type="old" />
		</div>

		<div>
			<DiffSection {changes} type="new" />
		</div>
	</div>
</section>
