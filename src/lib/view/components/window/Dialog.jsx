import Button from "@/lib/view/components/interface/Button";
import ButtonRow from "@/lib/view/components/layout/ButtonRow";
import classNames from "classnames";
import React from "react";

export default function Dialog({ icon, message, buttons, onConfirm }) {
	return (
		<div className={"max-w-[600px] cursor-default w-full"}>
			<div className={"flex flex-row p-10 text-center"}>
				{icon && <div className={classNames("text-[48px] mr-5", icon)} />}
				<div className={"flex-1"}>{message}</div>
			</div>
			{buttons && (
				<ButtonRow>
					{buttons.map((button) => (
						<Button
							key={button}
							text={button}
							onClick={() => onConfirm(button)}
						/>
					))}
				</ButtonRow>
			)}
		</div>
	);
}
