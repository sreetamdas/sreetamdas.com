import Credits from "./credits.mdx";

const Components = { credits: Credits };
export type MDXPagePaths = keyof typeof Components;

type Metadata = {
	title: string;
	description: string;
	published: boolean;
	updatedAt: string;
};

export async function getComponentFromSlug(slug: MDXPagePaths) {
	const { title, updatedAt, published, description } = (await import(`./${slug}.mdx`)) as Metadata;

	return { default: Components[slug], title, updatedAt, published, description };
}
