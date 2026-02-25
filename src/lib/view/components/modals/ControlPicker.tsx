import { Tab, TabPanel } from "@/lib/view/components/layout/TabPanel";
import { library } from "@/lib/view/global";
import React from "react";

const types = ["displays", "effects"];

export default function ControlPicker({ type, onSelect, onClose }: any) {
	function handleClick(item) {
		onSelect(item);
		onClose();
	}

	function hideImage(e) {
		e.target.style.display = "none";
	}

	const Catalog = ({ items }: any) => {
		return Object.keys(items).map((key, index) => {
			const item = items[key];
			const {
				config: { icon, label },
			} = item;

			return (
				<div key={index} className={"flex flex-col items-center mb-2.5 w-28"}>
					<div className={"bg-[#000_center] border-2 border-gray300 rounded-lg h-20 w-20 transition-[border-color_0.5s] overflow-hidden [&_img]:w-full [&_img]:h-auto [&:hover]:border-primary100 [&:hover]:transition-[none]"} onClick={() => handleClick(item)}>
						<img
							src={icon || "images/controls/Plugin.png"}
							alt={label}
							onError={hideImage}
						/>
					</div>
					<div className={"text-sm text-center my-1 mx-0"}>{label}</div>
				</div>
			);
		});
	};

	return (
		<TabPanel
			className={"w-full max-w-5xl h-96"}
			tabPosition="left"
			activeIndex={types.indexOf(type)}
		>
			<Tab name="Displays" contentClassName={"flex flex-row [flex-wrap:wrap] items-center justify-center p-2.5"}>
				<Catalog items={library.get("displays")} />
			</Tab>
			<Tab name="Effects" contentClassName={"flex flex-row [flex-wrap:wrap] items-center justify-center p-2.5"}>
				<Catalog items={library.get("effects")} />
			</Tab>
		</TabPanel>
	);
}
