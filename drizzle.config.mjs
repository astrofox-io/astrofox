import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db/schema.mjs",
	out: "./db/migrations",
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			"postgres://postgres:postgres@localhost:5432/astrofox",
	},
});
