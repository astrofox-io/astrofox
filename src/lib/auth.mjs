import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client.mjs";
import { account, session, user, verification } from "./db/schema.mjs";

function normalizeOrigin(value) {
	if (!value) {
		return null;
	}

	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

function parseOrigins(value) {
	if (!value) {
		return [];
	}

	return value
		.split(",")
		.map((item) => normalizeOrigin(item.trim()))
		.filter(Boolean);
}

const appPort = process.env.PORT || "3000";
const configuredOrigins = [
	...parseOrigins(process.env.BETTER_AUTH_URL),
	...parseOrigins(process.env.NEXT_PUBLIC_APP_URL),
	...parseOrigins(process.env.CORS_ORIGIN),
];

const fallbackBaseURL = `http://localhost:${appPort}`;
const baseURL = configuredOrigins[0] || fallbackBaseURL;

const trustedOrigins = Array.from(
	new Set([
		baseURL,
		...configuredOrigins,
		`http://localhost:${appPort}`,
		`http://127.0.0.1:${appPort}`,
		`https://localhost:${appPort}`,
		`https://127.0.0.1:${appPort}`,
	]),
);

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
	trustedOrigins,
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
