<script lang="ts">
	import SidebarItem from '$lib/components/sidebar/SidebarItem.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
	import SidebarCloseButton from '$lib/components/sidebar/SidebarCloseButton.svelte';
</script>

<div class="sidebar">
	<nav class="flex flex-col gap-2 px-4 py-4">
		<div class="flex justify-end">
			<SidebarCloseButton />
		</div>
		<ul>
			<SidebarItem text={'Home'} href={'/'} heading={true} icon={'home'} />
		</ul>
		<ul>
			<SidebarHeading text={'Blastose'} icon={'profile'} />
			<SidebarItem text={'My List'} href={'my-list'} />
			<SidebarItem text={'My Profile'} href={'profile'} />
			<SidebarItem text={'Sign out'} href={'signout'} />
		</ul>
		<ul>
			<SidebarHeading text={'Database'} icon={'database'} />
			<SidebarItem text={'Books'} href={'books'} />
			<SidebarItem text={'Series'} href={'series'} />
		</ul>
	</nav>
</div>

<style>
	.sidebar {
		background-color: var(--primary-100);
		width: 16rem;
		height: 100vh;
		position: sticky;
		overflow-x: auto;
		top: 0;
	}

	:global(.dark) .sidebar {
		background-color: var(--dark-600);
	}
</style>
