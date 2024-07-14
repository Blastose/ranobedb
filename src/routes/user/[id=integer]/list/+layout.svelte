<script lang="ts">
	export let data;
</script>

<div>
	<a href="{data.userListBasePath}">Books</a>
	<a href="{data.userListBasePath}/series">Series</a>
	<a href="{data.userListBasePath}/releases">Releases</a>
</div>

<slot />
