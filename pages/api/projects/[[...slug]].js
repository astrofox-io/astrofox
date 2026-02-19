import { randomUUID } from "node:crypto";
import { fromNodeHeaders } from "better-auth/node";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../../../server/auth.mjs";
import { db } from "../../../server/db/client.mjs";
import { projectRevisions, projects } from "../../../server/db/schema.mjs";

const createProjectSchema = z.object({
	name: z.string().trim().min(1).max(120).default("Untitled Project"),
});

const renameProjectSchema = z.object({
	name: z.string().trim().min(1).max(120),
});

const saveRevisionSchema = z.object({
	snapshot: z.unknown(),
	mediaRefs: z.array(z.unknown()).default([]),
});

const duplicateProjectSchema = z.object({
	name: z.string().trim().min(1).max(120).optional(),
});

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb",
		},
	},
};

function normalizeSlug(slug) {
	if (Array.isArray(slug)) {
		return slug;
	}

	if (typeof slug === "string") {
		return [slug];
	}

	return [];
}

function respondMethodNotAllowed(res, methods) {
	res.setHeader("Allow", methods);
	res.status(405).json({ message: "Method not allowed." });
}

function respondError(res, error) {
	if (error instanceof z.ZodError) {
		res.status(400).json({
			message: error.issues?.[0]?.message || "Invalid request payload.",
		});
		return;
	}

	const status = Number(error?.status || 500);
	const message = error?.message || "Unexpected server error.";

	// eslint-disable-next-line no-console
	console.error(error);

	res.status(status).json({ message });
}

async function requireSession(req, res) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (!session?.user) {
		res.status(401).json({ message: "Unauthorized" });
		return null;
	}

	return session;
}

async function getOwnedProject(projectId, ownerId) {
	const [project] = await db
		.select()
		.from(projects)
		.where(
			and(
				eq(projects.id, projectId),
				eq(projects.ownerId, ownerId),
				isNull(projects.deletedAt),
			),
		)
		.limit(1);

	return project || null;
}

async function getLatestRevision(projectId) {
	const [revision] = await db
		.select()
		.from(projectRevisions)
		.where(eq(projectRevisions.projectId, projectId))
		.orderBy(desc(projectRevisions.version))
		.limit(1);

	return revision || null;
}

async function listProjectsHandler(userId, res) {
	const items = await db
		.select({
			id: projects.id,
			name: projects.name,
			createdAt: projects.createdAt,
			updatedAt: projects.updatedAt,
			lastOpenedAt: projects.lastOpenedAt,
		})
		.from(projects)
		.where(and(eq(projects.ownerId, userId), isNull(projects.deletedAt)))
		.orderBy(desc(projects.updatedAt));

	res.status(200).json({ projects: items });
}

async function createProjectHandler(userId, req, res) {
	const payload = createProjectSchema.parse(req.body || {});
	const now = new Date();
	const id = randomUUID();

	const [project] = await db
		.insert(projects)
		.values({
			id,
			ownerId: userId,
			name: payload.name,
			createdAt: now,
			updatedAt: now,
			lastOpenedAt: now,
		})
		.returning();

	res.status(201).json({ project });
}

async function getProjectByIdHandler(userId, projectId, res) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		res.status(404).json({ message: "Project not found." });
		return;
	}

	const revision = await getLatestRevision(project.id);

	res.status(200).json({
		project,
		revision: revision
			? {
					id: revision.id,
					version: revision.version,
					snapshot: revision.snapshotJson,
					mediaRefs: revision.mediaRefs || [],
					createdAt: revision.createdAt,
				}
			: null,
	});
}

async function renameProjectHandler(userId, projectId, req, res) {
	const payload = renameProjectSchema.parse(req.body || {});
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		res.status(404).json({ message: "Project not found." });
		return;
	}

	const [updated] = await db
		.update(projects)
		.set({
			name: payload.name,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, project.id))
		.returning();

	res.status(200).json({ project: updated });
}

async function deleteProjectHandler(userId, projectId, res) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		res.status(404).json({ message: "Project not found." });
		return;
	}

	await db
		.update(projects)
		.set({
			deletedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(projects.id, project.id));

	res.status(204).end();
}

async function createRevisionHandler(userId, projectId, req, res) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		res.status(404).json({ message: "Project not found." });
		return;
	}

	const payload = saveRevisionSchema.parse(req.body || {});
	const now = new Date();

	const [result] = await db
		.select({ version: max(projectRevisions.version) })
		.from(projectRevisions)
		.where(eq(projectRevisions.projectId, project.id));
	const nextVersion = Number(result?.version || 0) + 1;

	const [revision] = await db
		.insert(projectRevisions)
		.values({
			id: randomUUID(),
			projectId: project.id,
			version: nextVersion,
			snapshotJson: payload.snapshot,
			mediaRefs: payload.mediaRefs,
			createdBy: userId,
			createdAt: now,
		})
		.returning();

	await db
		.update(projects)
		.set({
			updatedAt: now,
			lastOpenedAt: now,
		})
		.where(eq(projects.id, project.id));

	res.status(201).json({
		revision: {
			id: revision.id,
			version: revision.version,
			createdAt: revision.createdAt,
		},
	});
}

async function duplicateProjectHandler(userId, projectId, req, res) {
	const payload = duplicateProjectSchema.parse(req.body || {});
	const sourceProject = await getOwnedProject(projectId, userId);

	if (!sourceProject) {
		res.status(404).json({ message: "Project not found." });
		return;
	}

	const latestRevision = await getLatestRevision(sourceProject.id);
	const now = new Date();
	const newProjectId = randomUUID();

	const [newProject] = await db
		.insert(projects)
		.values({
			id: newProjectId,
			ownerId: userId,
			name: payload.name || `${sourceProject.name} copy`,
			createdAt: now,
			updatedAt: now,
			lastOpenedAt: now,
		})
		.returning();

	if (latestRevision) {
		await db.insert(projectRevisions).values({
			id: randomUUID(),
			projectId: newProjectId,
			version: 1,
			snapshotJson: latestRevision.snapshotJson,
			mediaRefs: latestRevision.mediaRefs || [],
			createdBy: userId,
			createdAt: now,
		});
	}

	res.status(201).json({ project: newProject });
}

export default async function projectsHandler(req, res) {
	try {
		const session = await requireSession(req, res);

		if (!session) {
			return;
		}

		const userId = session.user.id;
		const slug = normalizeSlug(req.query.slug);

		if (slug.length === 0) {
			if (req.method === "GET") {
				await listProjectsHandler(userId, res);
				return;
			}

			if (req.method === "POST") {
				await createProjectHandler(userId, req, res);
				return;
			}

			respondMethodNotAllowed(res, ["GET", "POST"]);
			return;
		}

		if (slug.length === 1) {
			const [projectId] = slug;

			if (req.method === "GET") {
				await getProjectByIdHandler(userId, projectId, res);
				return;
			}

			if (req.method === "PATCH") {
				await renameProjectHandler(userId, projectId, req, res);
				return;
			}

			if (req.method === "DELETE") {
				await deleteProjectHandler(userId, projectId, res);
				return;
			}

			respondMethodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
			return;
		}

		if (slug.length === 2) {
			const [projectId, action] = slug;

			if (action === "revisions") {
				if (req.method === "POST") {
					await createRevisionHandler(userId, projectId, req, res);
					return;
				}

				respondMethodNotAllowed(res, ["POST"]);
				return;
			}

			if (action === "duplicate") {
				if (req.method === "POST") {
					await duplicateProjectHandler(userId, projectId, req, res);
					return;
				}

				respondMethodNotAllowed(res, ["POST"]);
				return;
			}
		}

		res.status(404).json({ message: "Not found." });
	} catch (error) {
		respondError(res, error);
	}
}
