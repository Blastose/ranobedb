/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface UserSession {
		user: import('@supabase/supabase-js').User;
		accessToken?: string;
	}

	interface Locals extends UserSession {
		error: import('@supabase/supabase-js').ApiError;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Session extends UserSession {}
	// interface Platform {}
	// interface Stuff {}
}
