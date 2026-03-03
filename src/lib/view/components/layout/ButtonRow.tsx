import type React from "react";

interface ButtonRowProps {
	children?: React.ReactNode;
}

export default function ButtonRow({ children }: ButtonRowProps) {
	return <div className={"text-center mb-4"}>{children}</div>;
}
