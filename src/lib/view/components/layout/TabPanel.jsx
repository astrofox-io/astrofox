import classNames from "classnames";
import React, { useState, Children, cloneElement } from "react";

export function TabPanel({
	className,
	tabClassName,
	contentClassName,
	tabPosition = "top",
	activeIndex: initialActiveIndex,
	children,
}) {
	const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

	function handleTabClick(index) {
		setActiveIndex(index);
	}

	const tabs = [];
	const content = [];

	// Generate tabs and content
	Children.map(children, (child, index) => {
		tabs.push(
			<div
				key={index}
				className={classNames(
					"text-center list-none p-[8px_16px] cursor-default",
					{
						"bg-[var(--primary100)]": index === activeIndex,
					},
					tabClassName,
					child.props.className,
				)}
				onClick={() => handleTabClick(index)}
			>
				{child.props.name}
			</div>,
		);

		content.push(
			cloneElement(child, {
				key: index,
				className: child.props.contentClassName,
				visible: index === activeIndex,
			}),
		);
	});

	return (
		<div
			className={classNames(
				"flex flex-1",
				{
					["flex-row [&_.tabs]:w-[160px]"]: tabPosition === "left",
					["flex-row [&_.tabs]:order-[99] [&_.tabs]:w-[160px]"]: tabPosition === "right",
					["flex-col"]: tabPosition === "top",
					["flex-col [&_.tabs]:order-[99]"]: tabPosition === "bottom",
				},
				className,
			)}
		>
			<div
				className={classNames({
					["bg-[var(--gray75)]"]: true,
					["flex flex-row"]:
						tabPosition === "top" || tabPosition === "bottom",
				})}
			>
				{tabs}
			</div>
			<div className={classNames("w-full overflow-auto [&_.hidden]:hidden", contentClassName)}>
				{content}
			</div>
		</div>
	);
}

export const Tab = ({ visible, className, children }) => (
	<div
		className={classNames(
			{
				["hidden"]: !visible,
			},
			className,
		)}
	>
		{children}
	</div>
);
