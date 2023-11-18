<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let active: boolean;
	export let href: string;
	export let text: string;
	export let icon:
		| 'home'
		| 'logout'
		| 'profile'
		| 'mylist'
		| 'books'
		| 'series'
		| 'releases'
		| 'people'
		| 'publishers'
		| 'add'
		| 'login'
		| 'signup';
</script>

<li>
	<SidebarItem {active} {href} {text}>
		{#if icon === 'home'}
			<Icon name="home" />
		{:else if icon === 'logout'}
			<Icon name="logout" />
		{:else if icon === 'profile'}
			<Icon name="profile" />
		{:else if icon === 'mylist'}
			<Icon name="bookMultiple" />
		{:else if icon === 'books'}
			<Icon name="book" />
		{:else if icon === 'series'}
			<Icon name="bookshelf" />
		{:else if icon === 'releases'}
			<Icon name="file" />
		{:else if icon === 'people'}
			<Icon name="people" />
		{:else if icon === 'publishers'}
			<Icon name="company" />
		{:else if icon === 'add'}
			<Icon name="plus" />
		{:else if icon === 'login'}
			<Icon name="login" />
		{:else if icon === 'signup'}
			<Icon name="signup" />
		{/if}
	</SidebarItem>
</li>
