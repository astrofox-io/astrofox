import { fontVariables, inter } from "@/app/fonts";
import "@/app/tailwind.css";
import "@/lib/view/styles/index.css";

export const metadata = {
	title: "Astrofox",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${fontVariables} ${inter.className}`}>{children}</body>
		</html>
	);
}
