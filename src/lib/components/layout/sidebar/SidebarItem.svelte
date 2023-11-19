<script lang="ts">
	export let active: boolean;
	export let text: string;
	export let href: string;
</script>

<a {href}>
	<span class:active class="sidebar-item">
		<slot />
		{text}
	</span>
</a>
