import { cn } from "@/lib/helpers/utils";

export type LikeMutationAction = "like" | "unlike";

export function getLikeButtonClassName({ hasLiked }: { hasLiked: boolean }) {
	return cn(
		"inline-flex size-5 cursor-pointer items-center justify-center leading-none text-primary underline-offset-4 transition-colors hover:underline disabled:cursor-default disabled:hover:no-underline",
		hasLiked && "text-primary/80",
	);
}

export function getLikeHeartIconClassName({ isPending }: { isPending: boolean }) {
	return cn(
		"relative inline-flex size-5 items-center justify-center",
		isPending && "like-heart-shimmer",
	);
}

export function getLikeLoadingHeartIconClassName() {
	return cn("text-primary/70", getLikeHeartIconClassName({ isPending: true }));
}

export function getLikeMutationAction({
	hasLiked,
	isDev,
}: {
	hasLiked: boolean;
	isDev: boolean;
}): LikeMutationAction {
	return hasLiked && isDev ? "unlike" : "like";
}
