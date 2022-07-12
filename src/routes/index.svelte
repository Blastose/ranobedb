<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/sessionStore';

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error: any) {
			console.error(error);
		}
	};
</script>

<h1 class="text-2xl text-sky-600">Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev" class="text-blue-600">kit.svelte.dev</a> to read the documentation
</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>
<p>Dummy content</p>

{#if $user}
	<button class="rounded-md bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white" on:click={signOut}>
		Sign out
	</button>
{/if}
