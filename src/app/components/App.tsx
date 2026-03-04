import { ignoreEvents } from "@/lib/utils/react";
import { initApp } from "@/app/actions/app";
import Toolbar from "@/app/components/nav/Toolbar";
import LeftPanel from "@/app/components/panels/LeftPanel";
import ReactorPanel from "@/app/components/panels/ReactorPanel";
import RightPanel from "@/app/components/panels/RightPanel";
import Player from "@/app/components/player/Player";
import Stage from "@/app/components/stage/Stage";
import Modals from "@/app/components/window/Modals";
import Preload from "@/app/components/window/Preload";
import StatusBar from "@/app/components/window/StatusBar";
import TitleBar from "@/app/components/window/TitleBar";
import React, { useEffect } from "react";

function App() {
	useEffect(() => {
		initApp();
	}, []);

	return (
		<div
			className="flex flex-col flex-1 overflow-hidden relative w-full h-full"
			onDrop={ignoreEvents}
			onDragOver={ignoreEvents}
		>
			<Preload />
			<TitleBar />
			<div className="flex flex-row flex-1 overflow-hidden relative">
				<LeftPanel />
				<div
					id="viewport"
					className="flex flex-col flex-1 overflow-hidden relative"
				>
					<Toolbar />
					<Stage />
					<ReactorPanel />
				</div>
				<RightPanel />
			</div>
			<Player />
			<StatusBar />
			<Modals />
		</div>
	);
}

export default App;
