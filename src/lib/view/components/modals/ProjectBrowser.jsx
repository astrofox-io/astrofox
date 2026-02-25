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
import styles from "./ProjectBrowser.module.tailwind";

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
		<div className={styles.container}>
			<div className={styles.columns}>
				<div className={styles.listColumn}>
					<div className={styles.sectionTitle}>Projects</div>
					<div className={styles.list}>
						{projects.map((project) => (
							<button
								type="button"
								key={project.id}
								className={`${styles.item} ${
									project.id === selectedId ? styles.active : ""
								}`}
								onClick={() => setSelectedId(project.id)}
							>
								<div className={styles.itemName}>{project.name}</div>
							</button>
						))}
						{!loading && projects.length === 0 && (
							<div className={styles.empty}>No projects yet.</div>
						)}
					</div>
					<div className={styles.row}>
						<Button text="Refresh" onClick={refreshProjects} />
						<Button
							text="Open"
							disabled={!selectedId}
							onClick={handleOpenProject}
						/>
					</div>
				</div>

				<div className={styles.formColumn}>
					<div className={styles.sectionTitle}>Create New</div>
					<input
						className={styles.input}
						value={createName}
						onChange={(e) => setCreateName(e.currentTarget.value)}
					/>
					<div className={styles.row}>
						<Button text="Create" onClick={handleCreateProject} />
					</div>

					<div className={styles.sectionTitle}>Rename Selected</div>
					<input
						className={styles.input}
						value={renameName}
						onChange={(e) => setRenameName(e.currentTarget.value)}
						disabled={!selectedId}
					/>
					<div className={styles.row}>
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

			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
}
