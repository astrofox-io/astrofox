// @ts-nocheck
import { RangeInput } from "@/lib/view/components/inputs";
import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import { Volume, Volume2, Volume3, Volume4 } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useState } from "react";

const initialState = {
	value: 100,
	mute: false,
};

export default function VolumeControl() {
	const [state, setState] = useState(initialState);
	const { value, mute } = state;

	function handleChange(name, value) {
		setState({ value, mute: false });
		player.setVolume(value / 100);
	}

	function handleClick() {
		setState((prevState) => {
			player.setVolume(prevState.mute ? prevState.value / 100 : 0);

			return { ...prevState, mute: !prevState.mute };
		});
	}

	function getIcon() {
		let icon = null;

		if (value < 10 || mute) {
			icon = Volume4;
		} else if (value < 25) {
			icon = Volume3;
		} else if (value < 75) {
			icon = Volume2;
		} else {
			icon = Volume;
		}

		return icon;
	}

	return (
		<div className={"flex"}>
			<div
				className={classNames("mr-2.5 [&_.icon]:text-text100 [&_.icon]:w-5 [&_.icon]:h-5", { ["[&_.icon]:text-text300"]: mute })}
				onClick={handleClick}
			>
				<Icon className={""} glyph={getIcon()} />
			</div>
			<div className={"flex items-center w-24"}>
				<RangeInput
					name="volume"
					min={0}
					max={100}
					value={mute ? 0 : value}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
}
