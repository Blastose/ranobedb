<script lang="ts">
	import { enhance } from '$app/forms';

	export let text: string;
	export let action: string;
</script>

<li>
	<form method="post" {action} use:enhance>
		<button type="submit" class="sidebar-item">
			<slot />
			{text}
		</button>
	</form>
</li>
