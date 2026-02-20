import useProject, { relinkMediaRef } from "@/lib/view/actions/project";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";
import styles from "./RelinkMediaDialog.module.less";

export default function RelinkMediaDialog({ onClose }) {
	const mediaRefs = useProject((state) => state.unresolvedMediaRefs);
	const [loadingDisplayId, setLoadingDisplayId] = useState(null);

	async function handleRelink(ref) {
		setLoadingDisplayId(ref.displayId);
		await relinkMediaRef(ref);
		setLoadingDisplayId(null);
	}

	if (!mediaRefs.length) {
		return (
			<div className={styles.container}>
				<div className={styles.empty}>All media links are resolved.</div>
				<div className={styles.row}>
					<Button text="Close" onClick={onClose} />
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.description}>
				This project references local media files. Relink each source to render
				the project correctly.
			</div>
			<div className={styles.list}>
				{mediaRefs.map((ref) => (
					<div key={ref.displayId} className={styles.item}>
						<div className={styles.label}>
							{ref.label} ({ref.kind})
						</div>
						<Button
							text={
								loadingDisplayId === ref.displayId ? "Loading..." : "Relink"
							}
							disabled={loadingDisplayId === ref.displayId}
							onClick={() => handleRelink(ref)}
						/>
					</div>
				))}
			</div>
			<div className={styles.row}>
				<Button text="Close" onClick={onClose} />
			</div>
		</div>
	);
}
