import { fontVariables, inter } from "@/app/fonts";
import "@/app/tailwind.css";
import "@/app/styles/index.css";
import type React from "react";

export const metadata = {
	title: "Astrofox",
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${fontVariables} ${inter.className}`}>{children}</body>
		</html>
	);
}
