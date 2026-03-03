import classNames from "classnames";
import React, { useState, Children, cloneElement, isValidElement } from "react";

interface TabPanelProps {
	className?: string;
	tabClassName?: string;
	contentClassName?: string;
	tabPosition?: "top" | "bottom" | "left" | "right";
	activeIndex?: number;
	children?: React.ReactNode;
}

interface TabProps {
	name?: string;
	visible?: boolean;
	className?: string;
	contentClassName?: string;
	children?: React.ReactNode;
}

export function TabPanel({
	className,
	tabClassName,
	contentClassName,
	tabPosition = "top",
	activeIndex: initialActiveIndex,
	children,
}: TabPanelProps) {
	const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

	function handleTabClick(index: number) {
		setActiveIndex(index);
	}

	const tabs: React.ReactNode[] = [];
	const content: React.ReactNode[] = [];

	// Generate tabs and content
	Children.map(children, (child, index) => {
		if (!isValidElement<TabProps>(child)) return;

		tabs.push(
			<div
				key={index}
				className={classNames(
					"text-center list-none py-2 px-4 cursor-default",
					{
						"bg-primary": index === activeIndex,
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
					["flex-row [&_.tabs]:w-40"]: tabPosition === "left",
					["flex-row [&_.tabs]:order-[99] [&_.tabs]:w-40"]: tabPosition === "right",
					["flex-col"]: tabPosition === "top",
					["flex-col [&_.tabs]:order-[99]"]: tabPosition === "bottom",
				},
				className,
			)}
		>
			<div
				className={classNames({
					["bg-neutral-900"]: true,
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

export const Tab = ({ visible, className, children }: TabProps) => (
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
