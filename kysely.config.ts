import { defineConfig } from 'kysely-ctl';
import { Kysely, PostgresDialect } from 'kysely';
import dotenv from 'dotenv';
import pkg from 'pg';
const { types, Pool } = pkg;

// Return pg `date` as string instead of JS date
types.setTypeParser(types.builtins.DATE, (value: string) => {
	return value;
});

dotenv.config({ path: '.env' });

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = new Kysely<unknown>({
	dialect: new PostgresDialect({
		pool,
	}),
});

export default defineConfig({
	kysely: db,
	//   migrations: {
	//     migrationFolder: "migrations",
	//   },
	//   plugins: [],
	//   seeds: {
	//     seedFolder: "seeds",
	//   }
});
