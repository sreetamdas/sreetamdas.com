import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Get the stars and forks of a repository
 */
export default async (
	req: NextApiRequest,
	res: NextApiResponse<{ stars: number; forks: number }>
) => {
	try {
		const { owner, repo } = req.body;
		const { stargazers_count: stars = 0, forks = 0 } = (
			await axios.get<{ stargazers_count: number; forks: number }>(
				`https://api.github.com/repos/${owner}/${repo}`
			)
		).data;

		res.status(200).send({ stars, forks });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Request to api.github.com failed");

		res.status(200).send({ stars: 69, forks: 69 });
	}
};
