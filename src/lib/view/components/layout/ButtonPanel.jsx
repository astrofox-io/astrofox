import React from "react";

export default function ButtonPanel({ children }) {
	return <div className={"flex p-[5px] w-full bg-gray75 border-t border-t-gray300 border-b border-b-gray50 overflow-hidden [&_>_*]:mr-[5px]"}>{children}</div>;
}
