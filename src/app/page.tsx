"use client";

import Spinner from "@/app/components/interface/Spinner";
import dynamic from "next/dynamic";
import React, { useEffect, type CSSProperties } from "react";

const loadingScreenStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};

const AstrofoxApp = dynamic(() => import("@/app/components/App"), {
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
			Reflect.deleteProperty(globalThis, "eval");
			return;
		}

		import("@/app/global").then((globals) => {
			window._astrofox = globals;
		});
	}, []);

	return <AstrofoxApp />;
}
