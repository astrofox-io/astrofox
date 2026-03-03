import { ignoreEvents } from "@/lib/utils/react";
import { initApp } from "@/lib/view/actions/app";
import Toolbar from "@/lib/view/components/nav/Toolbar";
import LeftPanel from "@/lib/view/components/panels/LeftPanel";
import ReactorPanel from "@/lib/view/components/panels/ReactorPanel";
import RightPanel from "@/lib/view/components/panels/RightPanel";
import Player from "@/lib/view/components/player/Player";
import Stage from "@/lib/view/components/stage/Stage";
import Modals from "@/lib/view/components/window/Modals";
import Preload from "@/lib/view/components/window/Preload";
import StatusBar from "@/lib/view/components/window/StatusBar";
import TitleBar from "@/lib/view/components/window/TitleBar";
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
				</div>
				<RightPanel />
			</div>
			<Player />
			<ReactorPanel />
			<StatusBar />
			<Modals />
		</div>
	);
}

export default App;
