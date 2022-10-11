import * as url from "url";

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { getSentryKeyElements } from "@/domains/Sentry";

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const { publicKey, hostURL, projectID } = getSentryKeyElements();
const knownProjectIds = [projectID];

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const envelope = req.body;
	const pieces = envelope.split("\n");
	const header = JSON.parse(pieces[0]);

	const { host, path } = url.parse(header.dsn);

	if (host !== hostURL) {
		throw new Error(`invalid host: ${host}`);
	}

	const projectId = path?.replace(/\//g, "");
	if (!knownProjectIds.includes(projectId)) {
		throw new Error(`invalid project id: ${projectId}`);
	}

	const sentryUrl = `https://${hostURL}/api/${projectId}/envelope/`;
	const response = await axios.post(sentryUrl, envelope, {
		params: {
			sentry_key: publicKey,
		},
	});

	return res.status(response.status).send(response.data);
}

export default handler;

export const config = {
	api: {
		externalResolver: true,
	},
};
