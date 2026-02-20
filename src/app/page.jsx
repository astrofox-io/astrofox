"use client";

import Spinner from "@/lib/view/components/interface/Spinner";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const loadingScreenStyle = {
	position: "fixed",
	inset: 0,
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};

const AstrofoxApp = dynamic(() => import("@/lib/view/components/App"), {
	ssr: false,
	loading: () => (
		<div style={loadingScreenStyle}>
			<Spinner size={56} />
		</div>
	),
});

export default function HomePage() {
	useEffect(() => {
		if (process.env.NODE_ENV === "production") {
			// Disable eval in production, matching the previous Vite entrypoint behavior.
			globalThis.eval = undefined;
			return;
		}

		import("@/lib/view/global").then((globals) => {
			window._astrofox = globals;
		});
	}, []);

	return <AstrofoxApp />;
}
