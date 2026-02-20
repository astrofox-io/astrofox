import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.mjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({
	connectionString,
});

export const db = drizzle(pool, { schema });

export async function closeDatabase() {
	await pool.end();
}
