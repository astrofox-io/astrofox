import { toNodeHandler } from "better-auth/node";
import { auth } from "../../../server/auth.mjs";

const handler = toNodeHandler(auth);

export const config = {
	api: {
		bodyParser: false,
	},
};

export default function authCatchAllHandler(req, res) {
	return handler(req, res);
}
