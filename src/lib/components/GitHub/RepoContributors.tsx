/**
 * Displays avatars of non-bot contributors to the site's GitHub repo.
 * Data is fetched server-side via createServerFn, queried client-side
 * with useQuery so the page shell renders immediately.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchRepoContributors } from "@/lib/domains/GitHub";
import { LinkTo } from "@/lib/components/Anchor";

export const RepoContributors = () => {
	const fetchContributors = useServerFn(fetchRepoContributors);
	const { data: contributors, isLoading } = useQuery({
		queryFn: fetchContributors,
		queryKey: ["repo-contributors"],
	});

	if (isLoading) {
		return <p className="animate-pulse text-sm">Loading contributors...</p>;
	}

	if (!contributors || contributors.length === 0) {
		return <p className="text-sm">No contributors found.</p>;
	}

	return (
		<div className="flex flex-wrap gap-6 pt-4">
			{contributors.map(
				({ login, avatar_url, html_url }) =>
					html_url && (
						<LinkTo href={html_url} key={login} target="_blank">
							<div className="flex flex-col items-center gap-1">
								{avatar_url ? (
									<span className="rounded-global overflow-hidden">
										<img
											src={avatar_url}
											alt={login ?? ""}
											width={128}
											height={128}
											loading="lazy"
										/>
									</span>
								) : null}
								<p className="m-0 pb-2 text-sm">{login}</p>
							</div>
						</LinkTo>
					),
			)}
		</div>
	);
};
