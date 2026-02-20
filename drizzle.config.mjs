import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/server/db/schema.mjs",
	out: "./src/server/db/migrations",
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			"postgres://postgres:postgres@localhost:5432/astrofox",
	},
});
