<script lang="ts">
	import type { Change2 } from '../utils';
	import ChangeTextAgain from './ChangeTextAgain.svelte';

	export let changes: NonNullable<Change2>;
</script>

<div>
	<p class="font-semibold">{changes.name}</p>
	<div class="grid grid-cols-2">
		<div>
			<ChangeTextAgain {changes} type="old" />
		</div>

		<div>
			<ChangeTextAgain {changes} type="new" />
		</div>
	</div>
</div>
