import { Lucia, generateIdFromEntropySize } from 'lucia';
import { dev } from '$app/environment';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { pool } from '$lib/server/db/db';
import type { UserRole } from '$lib/server/db/dbTypes';
import type { DisplayPrefs } from '$lib/server/zod/schema';
import { getMode } from '$lib/mode/mode';

const adapter = new NodePostgresAdapter(pool, {
	session: 'auth_session',
	user: 'auth_user',
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			role: attributes.role,
			id_numeric: attributes.id_numeric,
			display_prefs: attributes.display_prefs,
		};
	},
});

export function generateId(): string {
	if (getMode() === 'production') {
		return generateIdFromEntropySize(25);
	} else {
		return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
	}
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	username_lowercase: string;
	id_numeric: number;
	role: UserRole;
	display_prefs: DisplayPrefs;
}
