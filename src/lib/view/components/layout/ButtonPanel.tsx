import React from "react";

export default function ButtonPanel({ children }: any) {
	return <div className={"flex p-1 w-full bg-gray75 border-t border-t-gray300 border-b border-b-gray50 overflow-hidden [&_>_*]:mr-1"}>{children}</div>;
}
