"use client";

/**
 * Magic-move code sequences for the TanStack Start deck.
 *
 * Each export is a small wrapper around <MagicMoveCode> holding an ordered list
 * of stages (code + optional caption). Keeping the multi-line code here (instead
 * of in the .re.mdx) avoids fighting the MDX formatter and keeps the slides
 * readable. Drop the wrapper into a slide and the deck morphs between stages as
 * you advance steps.
 */
import { MagicMoveCode } from "@/lib/domains/slides/MagicMove";

/** Type safety: old duplicated route types → Start's route-owned schema. */
export function TypeSafetyBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="route types"
			stages={[
				{
					caption: "Next Pages: write the dynamic param type, then assert it exists.",
					code: `type Query = { postId: string };

export const getStaticProps: GetStaticProps<Props, Query> = async ({ params }) => ({
  props: { postId: params!.postId },
});`,
				},
				{
					caption: "Next App Router: every page repeats and unwraps its params shape.",
					code: `type PageProps = { params: Promise<{ postId: string }> };

export default async function PostPage({ params }: PageProps) {
  return <Post postId={(await params).postId} />;
}`,
				},
				{
					caption: "Start: the dynamic param, loader data, and hooks are inferred from the route.",
					code: `export const Route = createFileRoute("/posts/$postId")({
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
});

function PostComponent() {
  const post = Route.useLoaderData();
  return <Post post={post} />;
}`,
				},
			]}
		/>
	);
}

/** 4. RSC: render a subtree on the server, hand it back as loader data. */
export function RscBuildUp() {
	return (
		<MagicMoveCode
			lang="tsx"
			fileName="blog/$slug/route.tsx"
			stages={[
				{
					caption: "An ordinary subtree.",
					code: `const Renderable = <MDXContent source={post.raw} />;`,
				},
				{
					caption: "Render it on the server.",
					code: `const Renderable = await renderServerComponent(
  <MDXContent source={post.raw} />,
);`,
				},
				{
					caption: "Hand it back as loader data; compose client islands on top.",
					code: `const Renderable = await renderServerComponent(
  <MDXContent
    source={post.raw}
    components={{ Sparkles, ChameleonHighlight }}
  />,
);

return { post, Renderable };`,
				},
			]}
		/>
	);
}
