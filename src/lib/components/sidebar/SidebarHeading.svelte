<script lang="ts">
	import Icon, { type IconType } from '../icon/Icon.svelte';

	export let text: string = '';
	export let icon: IconType = 'close';
</script>

<div class="flex items-center gap-1 px-2 py-1">
	<Icon height="24" width="24" name={icon} />
	<p class="font-semibold">
		{text}
	</p>
</div>
