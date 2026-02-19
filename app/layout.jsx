import "@/view/fonts.css";
import "@/view/styles/index.less";

export const metadata = {
	title: "Astrofox",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
