import * as url from "url";

import { withSentry, captureException } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

// Change host appropriately if you run your own Sentry instance.
const sentryHost = "sentry.io";

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
// const knownProjectIds = [];

async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const envelope = req.body;
		const pieces = envelope.split("\n");

		const header = JSON.parse(pieces[0]);

		const { host, path } = url.parse(header.dsn);
		if (host !== sentryHost) {
			throw new Error(`invalid host: ${host}`);
		}

		const projectId = path?.endsWith("/") ? path.slice(0, -1) : path;
		// if (!knownProjectIds.includes(projectId)) {
		// 	throw new Error(`invalid project id: ${projectId}`);
		// }

		const sentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`;
		const response = await fetch(sentryUrl, {
			method: "POST",
			body: envelope,
		});
		return response.json();
	} catch (e) {
		captureException(e);
		return res.status(400).json({ status: "invalid request" });
	}
}

export default withSentry(handler);

export const config = {
	api: {
		externalResolver: true,
	},
};
