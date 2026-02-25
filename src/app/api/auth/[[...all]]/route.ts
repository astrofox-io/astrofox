import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth.mjs";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

export const { GET, POST, PATCH, PUT, DELETE } = handler;
