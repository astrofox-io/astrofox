import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.mjs";
import { projectRevisions, projects } from "../db/schema.mjs";
import { requireSession } from "../middleware/requireSession.mjs";

const router = Router();

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

router.use(requireSession);

router.get("/", async (req, res, next) => {
	try {
		const items = await db
			.select({
				id: projects.id,
				name: projects.name,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
				lastOpenedAt: projects.lastOpenedAt,
			})
			.from(projects)
			.where(and(eq(projects.ownerId, req.user.id), isNull(projects.deletedAt)))
			.orderBy(desc(projects.updatedAt));

		res.json({ projects: items });
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const payload = createProjectSchema.parse(req.body || {});
		const now = new Date();
		const id = randomUUID();

		const [project] = await db
			.insert(projects)
			.values({
				id,
				ownerId: req.user.id,
				name: payload.name,
				createdAt: now,
				updatedAt: now,
				lastOpenedAt: now,
			})
			.returning();

		res.status(201).json({ project });
	} catch (error) {
		next(error);
	}
});

router.get("/:projectId", async (req, res, next) => {
	try {
		const project = await getOwnedProject(req.params.projectId, req.user.id);

		if (!project) {
			return res.status(404).json({ message: "Project not found." });
		}

		const revision = await getLatestRevision(project.id);

		return res.json({
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
	} catch (error) {
		return next(error);
	}
});

router.patch("/:projectId", async (req, res, next) => {
	try {
		const payload = renameProjectSchema.parse(req.body || {});
		const project = await getOwnedProject(req.params.projectId, req.user.id);

		if (!project) {
			return res.status(404).json({ message: "Project not found." });
		}

		const [updated] = await db
			.update(projects)
			.set({
				name: payload.name,
				updatedAt: new Date(),
			})
			.where(eq(projects.id, project.id))
			.returning();

		return res.json({ project: updated });
	} catch (error) {
		return next(error);
	}
});

router.post("/:projectId/revisions", async (req, res, next) => {
	try {
		const project = await getOwnedProject(req.params.projectId, req.user.id);

		if (!project) {
			return res.status(404).json({ message: "Project not found." });
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
				createdBy: req.user.id,
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

		return res.status(201).json({
			revision: {
				id: revision.id,
				version: revision.version,
				createdAt: revision.createdAt,
			},
		});
	} catch (error) {
		return next(error);
	}
});

router.post("/:projectId/duplicate", async (req, res, next) => {
	try {
		const payload = duplicateProjectSchema.parse(req.body || {});
		const sourceProject = await getOwnedProject(
			req.params.projectId,
			req.user.id,
		);

		if (!sourceProject) {
			return res.status(404).json({ message: "Project not found." });
		}

		const latestRevision = await getLatestRevision(sourceProject.id);
		const now = new Date();
		const newProjectId = randomUUID();

		const [newProject] = await db
			.insert(projects)
			.values({
				id: newProjectId,
				ownerId: req.user.id,
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
				createdBy: req.user.id,
				createdAt: now,
			});
		}

		return res.status(201).json({ project: newProject });
	} catch (error) {
		return next(error);
	}
});

router.delete("/:projectId", async (req, res, next) => {
	try {
		const project = await getOwnedProject(req.params.projectId, req.user.id);

		if (!project) {
			return res.status(404).json({ message: "Project not found." });
		}

		await db
			.update(projects)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(projects.id, project.id));

		return res.status(204).end();
	} catch (error) {
		return next(error);
	}
});

export default router;
