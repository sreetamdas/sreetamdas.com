import fs from "fs";

import { Feed } from "feed";

import { getAllBlogPostsData } from "@/utils/blog";

export const generateRssFeed = async () => {
	if (process.env.NODE_ENV === "development") {
		return;
	}
	const posts = await getAllBlogPostsData();
	const siteURL = process.env.SITE_URL ?? "https://sreetamdas.com";
	const date = new Date();
	const author = {
		name: "Sreetam Das",
		email: "sreetam@sreetamdas.com",
		link: "https://twitter.com/_SreetamDas",
	};

	const feed = new Feed({
		title: "Sreetam Das' blog",
		description:
			"Beginner friendly developer content, with a focus on React, TypeScript, Next.js and Styled-components",
		id: siteURL,
		link: siteURL,
		image: `${siteURL}/logo.svg`,
		favicon: `${siteURL}/favicon.png`,
		copyright: `All rights reserved ${date.getFullYear()}, Sreetam Das`,
		updated: date,
		generator: "Feed for Node.js",
		feedLinks: {
			rss2: `${siteURL}/rss/feed.xml`,
			json: `${siteURL}/rss/feed.json`,
			atom: `${siteURL}/rss/atom.xml`,
		},
		author,
	});

	posts.forEach(({ frontmatter, slug }) => {
		const url = `${siteURL}/blog/${slug}`;

		feed.addItem({
			title: frontmatter.title,
			id: url,
			link: url,
			description: frontmatter.summary,
			content: frontmatter.summary,
			author: [author],
			contributor: [author],
			date: new Date(frontmatter.publishedAt),
		});
	});

	fs.mkdirSync("./public/rss", { recursive: true });
	fs.writeFileSync("./public/rss/feed.xml", feed.rss2());
	fs.writeFileSync("./public/rss/atom.xml", feed.atom1());
	fs.writeFileSync("./public/rss/feed.json", feed.json1());
};
