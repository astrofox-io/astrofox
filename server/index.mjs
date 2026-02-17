import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth.mjs";
import projectsRouter from "./routes/projects.mjs";

const app = express();
const port = Number(process.env.API_PORT || 3005);
const clientOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
	cors({
		origin: clientOrigin,
		credentials: true,
	}),
);

app.all("/api/auth", toNodeHandler(auth));
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
	res.json({ ok: true });
});

app.use("/api/projects", projectsRouter);

app.use((error, _req, res, _next) => {
	const status = Number(error?.status || 500);
	const message = error?.message || "Unexpected server error.";

	// eslint-disable-next-line no-console
	console.error(error);

	res.status(status).json({ message });
});

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`Astrofox API listening on http://localhost:${port}`);
});
