<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Login - RanobeDB</title>
</svelte:head>

<h1>LOGIN</h1>
<form method="POST">
	<div class="max-w-7xl px-6 mx-auto flex flex-col gap-2">
		<label for="username">Username</label>
		<input id="username" name="username" />
		<label for="password">Password</label>
		<input type="password" id="password" name="password" />
		<button type="submit">Submit</button>
	</div>
</form>
