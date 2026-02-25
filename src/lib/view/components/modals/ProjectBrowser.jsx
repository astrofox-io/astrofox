import useProject, {
	DEFAULT_PROJECT_NAME,
	deleteProjectById,
	listProjects,
	loadProjectById,
	newProject,
	renameProjectById,
	saveProject,
} from "@/lib/view/actions/project";
import Button from "@/lib/view/components/interface/Button";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function ProjectBrowser({ onClose }) {
	const currentProjectId = useProject((state) => state.projectId);
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [createName, setCreateName] = useState(DEFAULT_PROJECT_NAME);
	const [renameName, setRenameName] = useState("");
	const [error, setError] = useState("");

	const selectedProject = useMemo(
		() => projects.find((project) => project.id === selectedId) || null,
		[projects, selectedId],
	);

	const refreshProjects = useCallback(async () => {
		setLoading(true);
		setError("");

		try {
			const items = await listProjects();
			setProjects(items);
			setSelectedId(
				(current) => current || currentProjectId || items[0]?.id || null,
			);
		} catch (requestError) {
			setError(requestError?.message || "Failed to load projects.");
		} finally {
			setLoading(false);
		}
	}, [currentProjectId]);

	useEffect(() => {
		refreshProjects();
	}, [refreshProjects]);

	useEffect(() => {
		setRenameName(selectedProject?.name || "");
	}, [selectedProject?.name]);

	async function handleOpenProject() {
		if (!selectedId) {
			return;
		}

		await loadProjectById(selectedId);
		onClose();
	}

	async function handleCreateProject() {
		const name = createName.trim() || DEFAULT_PROJECT_NAME;

		await newProject();
		const saved = await saveProject(name);

		if (saved) {
			onClose();
		}
	}

	async function handleRenameProject() {
		if (!selectedId || !renameName.trim()) {
			return;
		}

		await renameProjectById(selectedId, renameName.trim());
		await refreshProjects();
	}

	async function handleDeleteProject() {
		if (!selectedId || !selectedProject) {
			return;
		}

		const confirmed = window.confirm(
			`Delete "${selectedProject.name}"? This cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		await deleteProjectById(selectedId);
		await refreshProjects();
	}

	return (
		<div className={"flex flex-col gap-[12px] min-w-[620px]"}>
			<div className={"flex gap-[12px]"}>
				<div className={"list-column flex-1 flex flex-col gap-[8px]"}>
					<div className={"text-xs font-bold uppercase opacity-[0.8]"}>Projects</div>
					<div className={"flex flex-col gap-[4px] min-h-[220px] max-h-[220px] overflow-y-auto border border-[#444] p-[4px]"}>
						{projects.map((project) => (
							<button
								type="button"
								key={project.id}
								className={`${"w-full text-left bg-transparent p-[6px_8px] border border-[transparent] cursor-pointer [&:hover]:[border-color:#666]"} ${
									project.id === selectedId ? "[border-color:#0ec5ff] bg-[rgba(14,_197,_255,_0.12)]" : ""
								}`}
								onClick={() => setSelectedId(project.id)}
							>
								<div className={"text-xs"}>{project.name}</div>
							</button>
						))}
						{!loading && projects.length === 0 && (
							<div className={"opacity-[0.7] text-xs p-[8px]"}>No projects yet.</div>
						)}
					</div>
					<div className={"flex gap-[6px]"}>
						<Button text="Refresh" onClick={refreshProjects} />
						<Button
							text="Open"
							disabled={!selectedId}
							onClick={handleOpenProject}
						/>
					</div>
				</div>

				<div className={"flex-1 flex flex-col gap-[8px]"}>
					<div className={"text-xs font-bold uppercase opacity-[0.8]"}>Create New</div>
					<input
						className={"bg-[#181818] text-[#fff] border border-[#555] p-[7px_8px] text-xs"}
						value={createName}
						onChange={(e) => setCreateName(e.currentTarget.value)}
					/>
					<div className={"flex gap-[6px]"}>
						<Button text="Create" onClick={handleCreateProject} />
					</div>

					<div className={"text-xs font-bold uppercase opacity-[0.8]"}>Rename Selected</div>
					<input
						className={"bg-[#181818] text-[#fff] border border-[#555] p-[7px_8px] text-xs"}
						value={renameName}
						onChange={(e) => setRenameName(e.currentTarget.value)}
						disabled={!selectedId}
					/>
					<div className={"flex gap-[6px]"}>
						<Button
							text="Rename"
							disabled={!selectedId || !renameName.trim()}
							onClick={handleRenameProject}
						/>
						<Button
							text="Delete"
							disabled={!selectedId}
							onClick={handleDeleteProject}
						/>
					</div>
				</div>
			</div>

			{error && <div className={"text-[#ff7d7d] text-xs"}>{error}</div>}
		</div>
	);
}
