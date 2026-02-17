import { initApp } from "actions/app";
import useAuth, { bootstrapSession } from "actions/auth";
import AuthScreen from "components/auth/AuthScreen";
import Layout from "components/layout/Layout";
import ControlDock from "components/panels/ControlDock";
import ReactorPanel from "components/panels/ReactorPanel";
import Player from "components/player/Player";
import Stage from "components/stage/Stage";
import Modals from "components/window/Modals";
import Preload from "components/window/Preload";
import StatusBar from "components/window/StatusBar";
import TitleBar from "components/window/TitleBar";
import React, { useEffect, useState } from "react";
import { ignoreEvents } from "utils/react";

function App() {
	const loading = useAuth((state) => state.loading);
	const session = useAuth((state) => state.session);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		bootstrapSession();
	}, []);

	useEffect(() => {
		if (!loading && session && !initialized) {
			initApp().then(() => setInitialized(true));
		}
	}, [loading, session, initialized]);

	useEffect(() => {
		if (!session) {
			setInitialized(false);
		}
	}, [session]);

	if (loading || (session && !initialized)) {
		return (
			<Layout direction="column" full>
				<Preload />
			</Layout>
		);
	}

	if (!session) {
		return <AuthScreen />;
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
