import { NextApiRequest, NextApiResponse } from "next";

/**
 * Get the stars and forks of a repository
 */
export default async (
	req: NextApiRequest,
	res: NextApiResponse<{ stars: number; forks: number }>
) => {
	const { owner, repo } = req.body;
	const response = await (await fetch(`https://api.github.com/repos/${owner}/${repo}`)).json();

	const { stargazers_count: stars = 0, forks = 0 } = response;
	res.status(200).send({ stars, forks });
};
