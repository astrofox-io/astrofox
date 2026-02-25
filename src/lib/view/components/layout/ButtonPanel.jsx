import React from "react";

export default function ButtonPanel({ children }) {
	return <div className={"flex p-[5px] w-full bg-[var(--gray75)] border-t border-t-[var(--gray300)] border-b border-b-[var(--gray50)] overflow-hidden [&_>_*]:mr-[5px]"}>{children}</div>;
}
