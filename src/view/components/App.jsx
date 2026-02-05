import { initApp } from "actions/app";
import Layout from "components/layout/Layout";
import ControlDock from "components/panels/ControlDock";
import ReactorPanel from "components/panels/ReactorPanel";
import Player from "components/player/Player";
import Stage from "components/stage/Stage";
import Modals from "components/window/Modals";
import Preload from "components/window/Preload";
import StatusBar from "components/window/StatusBar";
import TitleBar from "components/window/TitleBar";
import React, { useEffect } from "react";
import { ignoreEvents } from "utils/react";

function App() {
	async function init() {
		await initApp();
	}

	useEffect(() => {
		init();
	}, []);

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
