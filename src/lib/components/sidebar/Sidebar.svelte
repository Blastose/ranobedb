<script lang="ts">
	import SidebarItem from '$lib/components/sidebar/SidebarItem.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
	import SidebarCloseButton from '$lib/components/sidebar/SidebarCloseButton.svelte';

	export let tabindex: boolean;
</script>

<div class="sidebar">
	<nav class="flex flex-col gap-2 px-4 py-4">
		<div class="flex justify-end">
			<SidebarCloseButton {tabindex} />
		</div>
		<ul>
			<SidebarItem text={'Home'} href={'/'} heading={true} icon={'home'} {tabindex} />
		</ul>
		<ul>
			<SidebarHeading text={'Blastose'} icon={'profile'} />
			<SidebarItem text={'My List'} href={'my-list'} {tabindex} />
			<SidebarItem text={'My Profile'} href={'profile'} {tabindex} />
			<SidebarItem text={'Sign out'} href={'signout'} {tabindex} />
		</ul>
		<ul>
			<SidebarHeading text={'Database'} icon={'database'} />
			<SidebarItem text={'Books'} href={'books'} {tabindex} />
			<SidebarItem text={'Series'} href={'series'} {tabindex} />
		</ul>
	</nav>
</div>

<style>
	.sidebar {
		background-color: var(--primary-100);
		width: 16rem;
		height: 100vh;
		position: fixed;
		z-index: 50;
		overflow-x: auto;
	}

	@media (min-width: 1024px) {
		.sidebar {
			position: sticky;
			top: 0;
		}
	}

	:global(.dark) .sidebar {
		background-color: var(--dark-600);
	}
</style>
