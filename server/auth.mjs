import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client.mjs";
import { account, session, user, verification } from "./db/schema.mjs";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3005";
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

const socialProviders =
	process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		? {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				},
			}
		: undefined;

export const auth = betterAuth({
	baseURL,
	basePath: "/api/auth",
	trustedOrigins: [baseURL, corsOrigin],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders,
});
