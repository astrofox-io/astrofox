import React from "react";
import styles from "./ButtonPanel.module.tailwind";

export default function ButtonPanel({ children }) {
	return <div className={styles.buttons}>{children}</div>;
}
