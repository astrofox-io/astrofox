ALTER TABLE "projects"
ADD COLUMN "snapshot_json" jsonb;

ALTER TABLE "projects"
ADD COLUMN "media_refs" jsonb DEFAULT '[]'::jsonb NOT NULL;

WITH latest AS (
	SELECT DISTINCT ON ("project_id")
		"project_id",
		"snapshot_json",
		"media_refs"
	FROM "project_revisions"
	ORDER BY "project_id", "version" DESC
)
UPDATE "projects" AS p
SET
	"snapshot_json" = latest."snapshot_json",
	"media_refs" = COALESCE(latest."media_refs", '[]'::jsonb)
FROM latest
WHERE latest."project_id" = p."id";

DROP TABLE "project_revisions";
