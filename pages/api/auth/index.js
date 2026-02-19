import { toNodeHandler } from "better-auth/node";
import { auth } from "../../../server/auth.mjs";

const handler = toNodeHandler(auth);

export const config = {
	api: {
		bodyParser: false,
	},
};

export default function authRootHandler(req, res) {
	return handler(req, res);
}
