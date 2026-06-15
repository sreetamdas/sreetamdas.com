"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

import { IS_CI, IS_DEV } from "@/config";
import { cn, normalizePathname } from "@/lib/helpers/utils";

import { incrementLikeServerFn, type LikeCount } from "./LikeButton.server";
import { type PageMetrics } from "./Metrics.server";
import { pageMetricsQueryKey, usePageMetrics } from "./usePageMetrics";

type LikeButtonProps = {
	slug?: string;
	disabled?: boolean;
};

// Rendered inline in the blog post outro, next to the view count and live
// viewers. An inline pill (not fixed/floating) that reads as a clear CTA.
const PILL_CLASSES =
	"flex items-center gap-2 rounded-full border-2 border-solid border-primary bg-background px-4 py-1.5 font-mono text-sm text-primary transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95";

export const LikeButton = ({ slug, disabled = IS_DEV || IS_CI }: LikeButtonProps) => {
	return <Likes slug={slug} disabled={disabled} />;
};

const Likes = ({ slug, disabled = false }: LikeButtonProps) => {
	const { pathname } = useLocation();
	const queryClient = useQueryClient();
	const normalizedPathname = normalizePathname(slug ?? pathname);
	const queryKey = pageMetricsQueryKey(normalizedPathname);

	const incrementLikeCount = useServerFn<() => Promise<LikeCount>>(() =>
		incrementLikeServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data, isLoading } = usePageMetrics(normalizedPathname, disabled);
	const { mutate, isPending } = useMutation({
		mutationFn: incrementLikeCount,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<PageMetrics>(queryKey);
			if (previous?.hasLiked) {
				return { previous };
			}

			queryClient.setQueryData<PageMetrics>(queryKey, (old) =>
				old ? { ...old, likes: old.likes + 1, hasLiked: true } : old,
			);

			return { previous };
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData<PageMetrics>(queryKey, context.previous);
			}
		},
		onSuccess: (likeCount) => {
			queryClient.setQueryData<PageMetrics>(queryKey, (old) =>
				old ? { ...old, ...likeCount } : old,
			);
		},
	});

	if (isLoading) {
		return (
			<div aria-busy role="status" className={cn(PILL_CLASSES, "opacity-70")}>
				<FaRegHeart aria-hidden className="size-4" />
				<span aria-hidden className="animate-pulse">
					·
				</span>
				<span className="sr-only">Loading like count</span>
			</div>
		);
	}

	const likeCount = data?.likes ?? 0;
	const hasLiked = data?.hasLiked ?? false;
	const readOnly = data?.readOnly ?? false;
	const isDisabled = disabled || hasLiked || isPending || readOnly;

	return (
		<button
			aria-label={getLikeAriaLabel(likeCount, hasLiked, readOnly)}
			aria-pressed={hasLiked}
			className={cn(
				PILL_CLASSES,
				isDisabled && "cursor-not-allowed opacity-70 motion-safe:hover:scale-100",
			)}
			disabled={isDisabled}
			onClick={() => {
				if (hasLiked || readOnly) {
					return;
				}

				mutate();
			}}
			title={getLikeAriaLabel(likeCount, hasLiked, readOnly)}
			type="button"
		>
			{hasLiked ? (
				<FaHeart
					aria-hidden
					className="size-4 motion-safe:animate-[reactionCountPulse_450ms_ease-out]"
				/>
			) : (
				<FaRegHeart aria-hidden className="size-4" />
			)}
			<span>{likeCount.toLocaleString()}</span>
		</button>
	);
};

function getLikeAriaLabel(likes: number, hasLiked: boolean, readOnly: boolean) {
	const likeCopy = likes === 1 ? "like" : "likes";
	const count = `${likes.toLocaleString()} ${likeCopy}`;

	if (readOnly) {
		return count;
	}

	return hasLiked ? `You liked this post — ${count}` : `Like this post — ${count}`;
}
