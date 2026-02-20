"use client";

import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const AstrofoxApp = dynamic(() => import("@/view/components/App"), {
	ssr: false,
	loading: () => <div>Loading Astrofox...</div>,
});

export default function HomePage() {
	useEffect(() => {
		if (process.env.NODE_ENV === "production") {
			// Disable eval in production, matching the previous Vite entrypoint behavior.
			globalThis.eval = undefined;
			return;
		}

		import("@/view/global").then((globals) => {
			window._astrofox = globals;
		});
	}, []);

	return <AstrofoxApp />;
}
