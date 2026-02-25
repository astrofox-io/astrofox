import useProject, { relinkMediaRef } from "@/lib/view/actions/project";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";

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
			<div className={"flex flex-col gap-2.5 min-w-[520px]"}>
				<div className={"text-xs opacity-[0.8]"}>All media links are resolved.</div>
				<div className={"flex justify-end"}>
					<Button text="Close" onClick={onClose} />
				</div>
			</div>
		);
	}

	return (
		<div className={"flex flex-col gap-2.5 min-w-[520px]"}>
			<div className={"text-xs opacity-[0.85]"}>
				This project references local media files. Relink each source to render
				the project correctly.
			</div>
			<div className={"flex flex-col gap-1.5"}>
				{mediaRefs.map((ref) => (
					<div key={ref.displayId} className={"flex items-center justify-between gap-2.5 p-[7px_8px] border border-[#444]"}>
						<div className={"text-xs"}>
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
			<div className={"flex justify-end"}>
				<Button text="Close" onClick={onClose} />
			</div>
		</div>
	);
}
