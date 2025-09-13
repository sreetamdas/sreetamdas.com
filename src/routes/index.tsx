import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { isUndefined } from "lodash-es";

import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";

const filePath = "count.txt";

async function readCount() {
	return parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
}

const getCount = createServerFn({
	method: "GET",
}).handler(() => {
	return readCount();
});

const updateCount = createServerFn({ method: "POST" })
	.validator((d: number) => d)
	.handler(async ({ data }) => {
		const count = await readCount();
		await fs.promises.writeFile(filePath, `${count + data}`);
	});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getCount(),
});

function Home() {
	const router = useRouter();
	const state = Route.useLoaderData();

  const post = rootPages.find((page) => page.page_slug === "introduction");

	if (isUndefined(post)) {
		throw new Error("introduction.mdx is missing");
	}

	return (
		<>
			<h1 className="py-20 text-center font-serif text-6xl font-bold tracking-tighter">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			<MDXContent code={post.code} />

			{/* <ViewsCounter slug="/" hidden /> */}
		</>
	);

	return (
		<button
			type="button"
			onClick={() => {
				updateCount({ data: 1 }).then(() => {
					router.invalidate();
				});
			}}
		>
			Add 1 to {state}?
		</button>
	);
}
