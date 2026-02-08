import { createFileRoute, Link } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { aoc_solutions } from "@/generated";

export const Route = createFileRoute("/(main)/aoc/")({
  component: AdventOfCodeIndexPage,
  head: () => ({
    meta: [
      {
        title: `Advent of Code ${SITE_TITLE_APPEND}`,
      },
      {
        name: "description",
        content: "Writeups and notes for Advent of Code solutions",
      },
    ],
  }),
  loader: () => {
    return [...aoc_solutions].sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
  },
});

function AdventOfCodeIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <>
      <h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
        Advent of Code
      </h1>

      <section className="grid gap-8 pb-10">
        {posts.map((post) => {
          const [year, day] = post.page_slug.split("/");
          return (
            <article
              key={post.page_slug}
              className="border-primary/20 border-l-4 pl-4"
            >
              <p className="text-sm uppercase opacity-70">{post.subheading}</p>
              <h2 className="font-serif text-3xl font-bold tracking-tight">
                <Link
                  to="/aoc/$year/$day"
                  params={{ year, day }}
                  className="link-base text-primary hover:text-secondary"
                >
                  {post.title.replaceAll("&shy;", "")}
                </Link>
              </h2>
              <p className="pt-2 text-sm opacity-80">{post.description}</p>
            </article>
          );
        })}
      </section>
    </>
  );
}
