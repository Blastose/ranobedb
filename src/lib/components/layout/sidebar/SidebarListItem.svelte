<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';

	interface Props {
		active: boolean;
		href: string;
		text: string;
		icon:
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
			| 'signup'
			| 'settings'
			| 'history'
			| 'email'
			| 'about'
			| 'calendar'
			| 'tag'
			| 'bell';
	}

	let { active, href, text, icon }: Props = $props();
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
		{:else if icon === 'settings'}
			<Icon name="settings" />
		{:else if icon === 'history'}
			<Icon name="history" />
		{:else if icon === 'email'}
			<Icon name="email" />
		{:else if icon === 'about'}
			<Icon name="information" />
		{:else if icon === 'calendar'}
			<Icon name="calendar" />
		{:else if icon === 'tag'}
			<Icon name="tag" />
		{:else if icon === 'bell'}
			<Icon name="bell" />
		{/if}
	</SidebarItem>
</li>
