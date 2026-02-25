import { ignoreEvents } from "@/lib/utils/react";
import { initApp } from "@/lib/view/actions/app";
import Spinner from "@/lib/view/components/interface/Spinner";
import Layout from "@/lib/view/components/layout/Layout";
import ControlDock from "@/lib/view/components/panels/ControlDock";
import ReactorPanel from "@/lib/view/components/panels/ReactorPanel";
import Player from "@/lib/view/components/player/Player";
import Stage from "@/lib/view/components/stage/Stage";
import Modals from "@/lib/view/components/window/Modals";
import Preload from "@/lib/view/components/window/Preload";
import StatusBar from "@/lib/view/components/window/StatusBar";
import TitleBar from "@/lib/view/components/window/TitleBar";
import React, { useEffect, useState } from "react";

const loadingContainerStyle = {
	width: "100%",
	height: "100%",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};

function App() {
	const [initialized, setInitialized] = useState(false);
	const [initError, setInitError] = useState(null);

	useEffect(() => {
		let mounted = true;

		if (!initialized) {
			initApp()
				.then(() => {
					if (!mounted) {
						return;
					}

					setInitialized(true);
					setInitError(null);
				})
				.catch((error) => {
					// eslint-disable-next-line no-console
					console.error("Failed to initialize app", error);

					if (mounted) {
						setInitError(error);
					}
				});
		}

		return () => {
			mounted = false;
		};
	}, [initialized]);

	if (!initialized && !initError) {
		return (
			<Layout direction="column" full>
				<div style={loadingContainerStyle}>
					<Spinner size={56} />
				</div>
			</Layout>
		);
	}

	if (initError) {
		return (
			<Layout direction="column" full>
				<div>
					Failed to initialize Astrofox. Check console/network logs and reload.
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			direction="column"
			onDrop={ignoreEvents}
			onDragOver={ignoreEvents}
			full
		>
			<Preload />
			<TitleBar />
			<Layout direction="row">
				<Layout id="viewport" direction="column">
					<Stage />
					<Player />
					<ReactorPanel />
				</Layout>
				<ControlDock />
			</Layout>
			<StatusBar />
			<Modals />
		</Layout>
	);
}

export default App;
