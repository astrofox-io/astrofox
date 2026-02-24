import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth.mjs";
import { db } from "@/lib/db/client.mjs";
import { projectRevisions, projects } from "@/lib/db/schema.mjs";

export const runtime = "nodejs";

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

function normalizeSlug(slug) {
	if (Array.isArray(slug)) {
		return slug;
	}

	if (typeof slug === "string") {
		return [slug];
	}

	return [];
}

function respondMethodNotAllowed(methods) {
	return NextResponse.json(
		{ message: "Method not allowed." },
		{
			status: 405,
			headers: {
				Allow: methods.join(", "),
			},
		},
	);
}

function respondError(error) {
	if (error instanceof z.ZodError) {
		return NextResponse.json(
			{
				message: error.issues?.[0]?.message || "Invalid request payload.",
			},
			{ status: 400 },
		);
	}

	const status = Number(error?.status || 500);
	const message = error?.message || "Unexpected server error.";

	// eslint-disable-next-line no-console
	console.error(error);

	return NextResponse.json({ message }, { status });
}

async function parseRequestJson(request) {
	try {
		return await request.json();
	} catch {
		return {};
	}
}

async function requireSession(request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session?.user) {
		return {
			response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
		};
	}

	return { session };
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

async function listProjectsHandler(userId) {
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

	return NextResponse.json({ projects: items }, { status: 200 });
}

async function createProjectHandler(userId, request) {
	const payload = createProjectSchema.parse(await parseRequestJson(request));
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

	return NextResponse.json({ project }, { status: 201 });
}

async function getProjectByIdHandler(userId, projectId) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		return NextResponse.json(
			{ message: "Project not found." },
			{ status: 404 },
		);
	}

	const revision = await getLatestRevision(project.id);

	return NextResponse.json(
		{
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
		},
		{ status: 200 },
	);
}

async function renameProjectHandler(userId, projectId, request) {
	const payload = renameProjectSchema.parse(await parseRequestJson(request));
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		return NextResponse.json(
			{ message: "Project not found." },
			{ status: 404 },
		);
	}

	const [updated] = await db
		.update(projects)
		.set({
			name: payload.name,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, project.id))
		.returning();

	return NextResponse.json({ project: updated }, { status: 200 });
}

async function deleteProjectHandler(userId, projectId) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		return NextResponse.json(
			{ message: "Project not found." },
			{ status: 404 },
		);
	}

	await db
		.update(projects)
		.set({
			deletedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(projects.id, project.id));

	return new Response(null, { status: 204 });
}

async function createRevisionHandler(userId, projectId, request) {
	const project = await getOwnedProject(projectId, userId);

	if (!project) {
		return NextResponse.json(
			{ message: "Project not found." },
			{ status: 404 },
		);
	}

	const payload = saveRevisionSchema.parse(await parseRequestJson(request));
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

	return NextResponse.json(
		{
			revision: {
				id: revision.id,
				version: revision.version,
				createdAt: revision.createdAt,
			},
		},
		{ status: 201 },
	);
}

async function duplicateProjectHandler(userId, projectId, request) {
	const payload = duplicateProjectSchema.parse(await parseRequestJson(request));
	const sourceProject = await getOwnedProject(projectId, userId);

	if (!sourceProject) {
		return NextResponse.json(
			{ message: "Project not found." },
			{ status: 404 },
		);
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

	return NextResponse.json({ project: newProject }, { status: 201 });
}

async function getSlug(context) {
	const maybeParams = context?.params;
	const params =
		typeof maybeParams?.then === "function" ? await maybeParams : maybeParams;
	return normalizeSlug(params?.slug);
}

async function handleRequest(request, context) {
	try {
		const { session, response } = await requireSession(request);

		if (response) {
			return response;
		}

		const userId = session.user.id;
		const slug = await getSlug(context);
		const method = request.method;

		if (slug.length === 0) {
			if (method === "GET") {
				return listProjectsHandler(userId);
			}

			if (method === "POST") {
				return createProjectHandler(userId, request);
			}

			return respondMethodNotAllowed(["GET", "POST"]);
		}

		if (slug.length === 1) {
			const [projectId] = slug;

			if (method === "GET") {
				return getProjectByIdHandler(userId, projectId);
			}

			if (method === "PATCH") {
				return renameProjectHandler(userId, projectId, request);
			}

			if (method === "DELETE") {
				return deleteProjectHandler(userId, projectId);
			}

			return respondMethodNotAllowed(["GET", "PATCH", "DELETE"]);
		}

		if (slug.length === 2) {
			const [projectId, action] = slug;

			if (action === "revisions") {
				if (method === "POST") {
					return createRevisionHandler(userId, projectId, request);
				}

				return respondMethodNotAllowed(["POST"]);
			}

			if (action === "duplicate") {
				if (method === "POST") {
					return duplicateProjectHandler(userId, projectId, request);
				}

				return respondMethodNotAllowed(["POST"]);
			}
		}

		return NextResponse.json({ message: "Not found." }, { status: 404 });
	} catch (error) {
		return respondError(error);
	}
}

export async function GET(request, context) {
	return handleRequest(request, context);
}

export async function POST(request, context) {
	return handleRequest(request, context);
}

export async function PATCH(request, context) {
	return handleRequest(request, context);
}

export async function DELETE(request, context) {
	return handleRequest(request, context);
}
