<script lang="ts">
	export let type: 'success' | 'error';
</script>

<div
	class="
py-2 px-4 border rounded-md
{type === 'success' ? 'border-green-400 text-green-800 bg-green-300' : ''}
{type === 'error' ? 'border-red-400 text-red-900 bg-red-300' : ''}"
>
	<slot />
</div>
