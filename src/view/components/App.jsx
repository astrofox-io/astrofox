import { ignoreEvents } from "@/utils/react";
import { initApp } from "@/view/actions/app";
import useAuth, { bootstrapSession } from "@/view/actions/auth";
import AuthScreen from "@/view/components/auth/AuthScreen";
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
	const loading = useAuth((state) => state.loading);
	const session = useAuth((state) => state.session);
	const [initialized, setInitialized] = useState(false);
	const [initError, setInitError] = useState(null);

	useEffect(() => {
		bootstrapSession();
	}, []);

	useEffect(() => {
		if (!loading && session && !initialized) {
			initApp()
				.then(() => {
					setInitialized(true);
					setInitError(null);
				})
				.catch((error) => {
					// eslint-disable-next-line no-console
					console.error("Failed to initialize app", error);
					setInitError(error);
				});
		}
	}, [loading, session, initialized]);

	useEffect(() => {
		if (!session) {
			setInitialized(false);
			setInitError(null);
		}
	}, [session]);

	if (loading || (session && !initialized && !initError)) {
		return (
			<Layout direction="column" full>
				<div>Loading Astrofox...</div>
			</Layout>
		);
	}

	if (!session) {
		return <AuthScreen />;
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
