import fonts from "@/lib/config/fonts.json";
import { resolveFontFamily } from "@/lib/view/fontFamilies";
import React from "react";

export default function Preload() {
	return (
		<div className={"fixed left-[100%] bottom-[-100%] h-[0] w-[0] overflow-hidden z-[var(--z-index-hidden)]"}>
			{fonts.map((font) => (
				<span key={font} style={{ fontFamily: resolveFontFamily(font) }}>
					{font}
				</span>
			))}
		</div>
	);
}
