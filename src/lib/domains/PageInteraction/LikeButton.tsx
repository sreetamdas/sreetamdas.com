"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

import { IS_CI, IS_DEV } from "@/config";
import { cn, normalizePathname } from "@/lib/helpers/utils";

import { fetchLikeCountServerFn, incrementLikeServerFn, type LikeCount } from "./LikeButton.server";

type LikeButtonProps = {
	slug?: string;
	disabled?: boolean;
};

// Floats in the right gutter next to the content column on desktop, and as a
// bottom-right pill on smaller screens where that gutter collapses.
const POSITION_CLASSES =
	"fixed right-4 bottom-4 z-40 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-[calc(50%_+_var(--max-width)/2_+_1rem)] lg:-translate-y-1/2";

const PILL_CLASSES =
	"flex items-center gap-2 rounded-full border-2 border-solid border-primary bg-background px-4 py-2 font-mono text-sm text-primary shadow-lg transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95";

export const LikeButton = ({ slug, disabled = IS_DEV || IS_CI }: LikeButtonProps) => {
	return <Likes slug={slug} disabled={disabled} />;
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
				return { previousLikeCount };
			}

			queryClient.setQueryData<LikeCount>(queryKey, {
				likes: (previousLikeCount?.likes ?? data?.likes ?? 0) + 1,
				hasLiked: true,
			});

			return { previousLikeCount };
		},
		onError: (_error, _variables, context) => {
			if (context?.previousLikeCount) {
				queryClient.setQueryData<LikeCount>(queryKey, context.previousLikeCount);
			}
		},
		onSuccess: (likeCount) => {
			queryClient.setQueryData<LikeCount>(queryKey, likeCount);
		},
	});

	if (isLoading) {
		return (
			<div aria-busy role="status" className={cn(POSITION_CLASSES, PILL_CLASSES, "opacity-70")}>
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
				POSITION_CLASSES,
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
