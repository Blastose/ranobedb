<script lang="ts">
	import SidebarItem from '$lib/components/sidebar/SidebarItem.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
</script>

<div class="sidebar">
	<div class="flex flex-col gap-2 px-4 py-4">
		<div>
			<SidebarItem text={'Home'} href={'/'} heading={true} icon={'home'} />
		</div>
		<div>
			<SidebarHeading text={'Blastose'} icon={'profile'} />
			<SidebarItem text={'My List'} href={'my-list'} />
			<SidebarItem text={'My Profile'} href={'profile'} />
			<SidebarItem text={'Sign out'} href={'signout'} />
		</div>
		<div>
			<SidebarHeading text={'Database'} icon={'database'} />
			<SidebarItem text={'Books'} href={'books'} />
			<SidebarItem text={'Series'} href={'series'} />
		</div>
	</div>
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
