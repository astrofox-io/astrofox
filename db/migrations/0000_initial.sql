CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"last_opened_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" integer NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"media_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "session"
ADD CONSTRAINT "session_user_id_user_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "account"
ADD CONSTRAINT "account_user_id_user_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "projects"
ADD CONSTRAINT "projects_owner_id_user_id_fk"
FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_project_id_projects_id_fk"
FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "project_revisions"
ADD CONSTRAINT "project_revisions_created_by_user_id_fk"
FOREIGN KEY ("created_by") REFERENCES "public"."user"("id")
ON DELETE cascade ON UPDATE no action;

CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");
CREATE UNIQUE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id", "account_id");
CREATE INDEX "projects_owner_updated_idx" ON "projects" USING btree ("owner_id", "updated_at");
CREATE UNIQUE INDEX "project_revisions_project_version_idx" ON "project_revisions" USING btree ("project_id", "version");
CREATE INDEX "project_revisions_project_order_idx" ON "project_revisions" USING btree ("project_id", "version");
