"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { IS_CI, IS_DEV } from "@/config";
import {
	fetchLikeCountServerFn,
	incrementLikeServerFn,
	type LikeCount,
} from "@/lib/components/LikeButton.serverFns";
import { cn, normalizePathname } from "@/lib/helpers/utils";

type LikeButtonProps = {
	slug?: string;
	disabled?: boolean;
};

export const LikeButton = ({ slug, disabled = IS_DEV || IS_CI }: LikeButtonProps) => {
	return (
		<div className="mx-auto mb-5 flex w-full flex-row items-center justify-center gap-2">
			<span role="img" aria-label="heart">
				💜
			</span>
			<Likes slug={slug} disabled={disabled} />
		</div>
	);
};

const Likes = ({ slug, disabled }: LikeButtonProps) => {
	const { pathname } = useLocation();
	const queryClient = useQueryClient();
	const normalizedPathname = normalizePathname(slug ?? pathname);
	const queryKey = [normalizedPathname, "get-likes"];

	const fetchLikeCount = useServerFn<() => Promise<LikeCount>>(() =>
		fetchLikeCountServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const incrementLikeCount = useServerFn<() => Promise<LikeCount>>(() =>
		incrementLikeServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data, isLoading } = useQuery({
		queryFn: fetchLikeCount,
		queryKey,
		staleTime: 1000 * 30,
	});
	const { mutate, isPending } = useMutation({
		mutationFn: incrementLikeCount,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });

			const previousLikeCount = queryClient.getQueryData<LikeCount>(queryKey);
			if (previousLikeCount?.hasLiked) {
				return;
			}

			queryClient.setQueryData<LikeCount>(queryKey, {
				likes: (previousLikeCount?.likes ?? data?.likes ?? 0) + 1,
				hasLiked: true,
			});
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey });
		},
		onSuccess: (likeCount) => {
			queryClient.setQueryData<LikeCount>(queryKey, likeCount);
		},
	});

	if (isLoading) {
		return <p className="m-0 animate-pulse text-xs">Getting like count</p>;
	}

	const hasLiked = data?.hasLiked ?? false;

	return (
		<button
			className={cn(
				"m-0 cursor-pointer border-0 bg-transparent p-0 text-xs text-current",
				(disabled || hasLiked || isPending) && "cursor-not-allowed opacity-70",
			)}
			disabled={disabled || hasLiked || isPending}
			onClick={() => {
				if (hasLiked) {
					return;
				}

				mutate();
			}}
			type="button"
		>
			{getLikeCountCopy(data?.likes, hasLiked)}
		</button>
	);
};

function getLikeCountCopy(likes: number | undefined, hasLiked: boolean) {
	const likeCount = likes ?? 0;
	const likeCopy = likeCount === 1 ? "like" : "likes";
	const actionCopy = hasLiked ? "Thanks for liking this post." : "Like this post.";

	return (
		<>
			{actionCopy} <LikeCount>{likeCount.toLocaleString()}</LikeCount> {likeCopy}
		</>
	);
}

const LikeCount = ({ children }: { children: string }) => (
	<span className="rounded-global border-primary bg-background text-primary border-2 border-solid p-1 font-mono text-base transition-colors">
		{children}
	</span>
);
