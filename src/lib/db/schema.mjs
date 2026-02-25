import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

const timestampColumns = {
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "date",
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", {
		withTimezone: true,
		mode: "date",
	})
		.notNull()
		.defaultNow(),
};

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	...timestampColumns,
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		token: text("token").notNull().unique(),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "date",
		}).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestampColumns,
	},
	(table) => ({
		userIdIdx: index("session_user_id_idx").on(table.userId),
	}),
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
			mode: "date",
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
			mode: "date",
		}),
		scope: text("scope"),
		password: text("password"),
		...timestampColumns,
	},
	(table) => ({
		userIdIdx: index("account_user_id_idx").on(table.userId),
		providerAccountIdx: uniqueIndex("account_provider_account_idx").on(
			table.providerId,
			table.accountId,
		),
	}),
);

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
	...timestampColumns,
});

export const projects = pgTable(
	"projects",
	{
		id: text("id").primaryKey(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		lastOpenedAt: timestamp("last_opened_at", {
			withTimezone: true,
			mode: "date",
		}),
		snapshotJson: jsonb("snapshot_json"),
		mediaRefs: jsonb("media_refs").notNull().default([]),
		deletedAt: timestamp("deleted_at", {
			withTimezone: true,
			mode: "date",
		}),
		...timestampColumns,
	},
	(table) => ({
		ownerUpdatedIdx: index("projects_owner_updated_idx").on(
			table.ownerId,
			table.updatedAt,
		),
	}),
);
