import { createFileRoute } from "@tanstack/react-router";

import buildInfo from "@/build-info.json";
import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/(pure)/version")({
	component: VersionPage,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/version") }],
		meta: [
			{ title: `Version ${SITE_TITLE_APPEND}` },
			{ name: "description", content: "Build version and deployment info" },
			{ property: "og:title", content: `Version ${SITE_TITLE_APPEND}` },
			{ property: "og:description", content: "Build version and deployment info" },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/version") },
		],
	}),
});

function VersionPage() {
	const { branch, commit, commitUrl, time } = buildInfo;
	const commitLink = `https://github.com/sreetamdas/sreetamdas.com/commit/${commitUrl}`;
	const branchLink = `https://github.com/sreetamdas/sreetamdas.com/tree/${branch}`;
	const buildTime = new Date(time).toLocaleString();

	return (
		<div className="px-2">
			<div className="rounded-global border-primary mx-auto my-5 w-fit max-w-sm border-2 px-5 py-5 font-mono text-sm sm:max-w-lg">
				<h1 className="mb-4 text-2xl font-bold tracking-tight">Build Version</h1>

				<dl className="space-y-3">
					<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
						<dt className="text-muted-foreground min-w-[100px] text-sm uppercase">Branch</dt>
						<dd>
							<a
								href={branchLink}
								className="link-base font-medium"
								target="_blank"
								rel="noreferrer"
							>
								{branch}
							</a>
						</dd>
					</div>

					<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
						<dt className="text-muted-foreground min-w-[100px] text-sm uppercase">Commit</dt>
						<dd>
							<a
								href={commitLink}
								className="link-base font-medium"
								target="_blank"
								rel="noreferrer"
							>
								{commit}
							</a>
						</dd>
					</div>

					<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
						<dt className="text-muted-foreground min-w-[100px] text-sm uppercase">Built</dt>
						<dd className="font-medium">{buildTime}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
