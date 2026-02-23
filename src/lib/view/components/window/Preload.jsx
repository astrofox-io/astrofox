import fonts from "@/lib/config/fonts.json";
import { resolveFontFamily } from "@/lib/view/fontFamilies";
import React from "react";
import styles from "./Preload.module.less";

export default function Preload() {
	return (
		<div className={styles.preload}>
			{fonts.map((font) => (
				<span key={font} style={{ fontFamily: resolveFontFamily(font) }}>
					{font}
				</span>
			))}
		</div>
	);
}
