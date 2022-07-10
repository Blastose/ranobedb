<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';

	export let sidebarShow = true;
	export let toggleSidebar: () => void;
</script>

<div class="duration-150 ease-in-out {sidebarShow ? '' : '-ml-64'} ">
	<nav
		class="overflow-y-scroll overflow-x-auto h-screen w-64 sticky top-0 bg-[#e4e7ee] drop-shadow-sm
    "
	>
		<div class="px-4 flex flex-col">
			<button class="hover:bg-[#cdcedd] self-end px-4" on:click={toggleSidebar}>X</button>
			<SidebarItem text={'Link1'} href={'/'} />
			<SidebarItem text={'Link1'} href={'/a'} />
			<SidebarItem text={'Link1'} href={'/b'} />
			<SidebarItem text={'Link1'} href={'/c'} />
			<SidebarItem text={'Link1'} href={'/d'} />
		</div>
	</nav>
</div>
