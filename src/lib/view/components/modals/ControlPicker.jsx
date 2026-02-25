import { Tab, TabPanel } from "@/lib/view/components/layout/TabPanel";
import { library } from "@/lib/view/global";
import React from "react";

const types = ["displays", "effects"];

export default function ControlPicker({ type, onSelect, onClose }) {
	function handleClick(item) {
		onSelect(item);
		onClose();
	}

	function hideImage(e) {
		e.target.style.display = "none";
	}

	const Catalog = ({ items }) => {
		return Object.keys(items).map((key, index) => {
			const item = items[key];
			const {
				config: { icon, label },
			} = item;

			return (
				<div key={index} className={"flex flex-col items-center mb-[10px] w-[110px]"}>
					<div className={"bg-[#000_center] border-[2px] border-[var(--gray300)] rounded-[7px] h-[84px] w-[84px] transition-[border-color_0.5s] overflow-hidden [&_img]:w-full [&_img]:h-[auto] [&:hover]:[border-color:var(--primary100)] [&:hover]:transition-[none]"} onClick={() => handleClick(item)}>
						<img
							src={icon || "images/controls/Plugin.png"}
							alt={label}
							onError={hideImage}
						/>
					</div>
					<div className={"text-[var(--font-size-small)] text-center m-[5px_0]"}>{label}</div>
				</div>
			);
		});
	};

	return (
		<TabPanel
			className={"w-[720px] h-[400px]"}
			tabPosition="left"
			activeIndex={types.indexOf(type)}
		>
			<Tab name="Displays" contentClassName={"flex flex-row [flex-wrap:wrap] items-center justify-center p-[10px]"}>
				<Catalog items={library.get("displays")} />
			</Tab>
			<Tab name="Effects" contentClassName={"flex flex-row [flex-wrap:wrap] items-center justify-center p-[10px]"}>
				<Catalog items={library.get("effects")} />
			</Tab>
		</TabPanel>
	);
}
