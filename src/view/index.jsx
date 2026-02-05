import App from "components/App";
import React from "react";
import { createRoot } from "react-dom/client";
import * as globals from "./global";
import "styles/index.less";
import "./fonts.css";

// Development settings
if (process.env.NODE_ENV !== "production") {
	window._astrofox = globals;
}

// Production settings
if (process.env.NODE_ENV === "production") {
	// Disable eval
	// eslint-disable-next-line no-eval
	globalThis.eval = undefined;
}

const container = document.getElementById("app");
const root = createRoot(container);

root.render(<App />);
