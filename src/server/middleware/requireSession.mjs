import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.mjs";

export async function requireSession(req, res, next) {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});

		if (!session?.user) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		req.session = session.session;
		req.user = session.user;

		return next();
	} catch (error) {
		return next(error);
	}
}
