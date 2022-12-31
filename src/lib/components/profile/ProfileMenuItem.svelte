<script lang="ts">
	import profileMenu from '$lib/stores/profileMenu';

	export let text: string = '';
	export let href: string = '';
</script>

<li class="sidebar-item">
	<a {href} on:click={() => profileMenu.set(false)}>
		<p class="px-4 py-1">{text}</p>
	</a>
</li>
