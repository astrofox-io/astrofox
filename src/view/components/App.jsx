import { ignoreEvents } from "@/utils/react";
import { initApp } from "@/view/actions/app";
import { bootstrapSession } from "@/view/actions/auth";
import Layout from "@/view/components/layout/Layout";
import ControlDock from "@/view/components/panels/ControlDock";
import ReactorPanel from "@/view/components/panels/ReactorPanel";
import Player from "@/view/components/player/Player";
import Stage from "@/view/components/stage/Stage";
import Modals from "@/view/components/window/Modals";
import Preload from "@/view/components/window/Preload";
import StatusBar from "@/view/components/window/StatusBar";
import TitleBar from "@/view/components/window/TitleBar";
import React, { useEffect, useState } from "react";

function App() {
	const [sessionReady, setSessionReady] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const [initError, setInitError] = useState(null);

	useEffect(() => {
		let mounted = true;

		bootstrapSession().finally(() => {
			if (mounted) {
				setSessionReady(true);
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;

		if (sessionReady && !initialized) {
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
	}, [sessionReady, initialized]);

	if (!sessionReady || (!initialized && !initError)) {
		return (
			<Layout direction="column" full>
				<div>Loading Astrofox...</div>
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
