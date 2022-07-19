import * as url from "url";

import { withSentry, captureException } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { getSentryKeyElements } from "@/domains/sentry";

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const { ingestURL, projectID } = getSentryKeyElements();
const knownProjectIds = [projectID];

async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const envelope = req.body;
		const pieces = envelope.split("\n");
		const header = JSON.parse(pieces[0]);

		const { host, path } = url.parse(header.dsn);

		if (host !== ingestURL) {
			throw new Error(`invalid host: ${host}`);
		}

		const projectId = path?.replace(/\//g, "");
		if (!knownProjectIds.includes(projectId)) {
			throw new Error(`invalid project id: ${projectId}`);
		}

		const sentryUrl = `https://${ingestURL}/api/${projectId}/envelope/`;
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
