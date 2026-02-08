import { isEmpty, isNil } from "lodash-es";
import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod";

import { SITE_OG_IMAGE, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { aoc_solutions } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Blockquote, Highlight } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { cn } from "@/lib/helpers/utils";

import {
  ParseInput,
  Part1,
  ProcessPulses,
} from "../../-aoc/[...slug]/pulse-propagation";

const routeParams = z.object({
  year: z.string().min(1),
  day: z.string().min(1),
});

export const Route = createFileRoute("/(main)/aoc/$year/$day")({
  component: AdventOfCodeSolutionPage,
  params: {
    parse: (params) => routeParams.parse(params),
  },
  loader: ({ params }) => {
    const fullSlug = `${params.year}/${params.day}`;
    const post = aoc_solutions.find((page) => page.page_slug === fullSlug);

    if (isNil(post)) {
      throw notFound();
    }

    return { post, fullSlug };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
      },
      {
        name: "description",
        content: loaderData?.post.description,
      },
      {
        property: "og:title",
        content: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
      },
      {
        property: "og:description",
        content: loaderData?.post.description,
      },
      {
        property: "og:type",
        content: "article",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/aoc/${loaderData?.fullSlug}`,
      },
      {
        property: "og:image",
        content: loaderData?.post.image ?? SITE_OG_IMAGE,
      },
      {
        property: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
      },
      {
        property: "twitter:description",
        content: loaderData?.post.description,
      },
      {
        property: "twitter:image",
        content: loaderData?.post.image ?? SITE_OG_IMAGE,
      },
    ],
  }),
});

function AdventOfCodeSolutionPage() {
  const { post } = Route.useLoaderData();
  const hasSubheading = !isEmpty(post.subheading);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.structured_data),
        }}
      />
      <ReadingProgress />

      {hasSubheading ? (
        <small className="pt-10 font-serif text-xl">{post.subheading}</small>
      ) : null}

      <h1
        className={cn(
          "hyphens-manual pb-20 font-serif text-8xl font-bold tracking-tighter max-sm:text-7xl",
          !hasSubheading && "pt-10",
        )}
      >
        <span
          className="whitespace-pre-wrap text-balance bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </h1>

      <MDXContent
        source={post.raw}
        components={{
          blockquote: (props) => (
            <Blockquote
              {...props}
              className="my-5 bg-karma-background font-mono font-light text-[#D7D7D7] dark:bg-karma-background [&_strong]:text-(--dark-blue)"
            />
          ),
          Highlight,
          InfoBlock,
          ParseInput,
          ProcessPulses,
          Part1,
        }}
      />

      <ViewsCounter slug={post.url ?? post.page_path} />
    </>
  );
}
