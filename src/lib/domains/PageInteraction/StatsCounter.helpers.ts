import { cn } from "@/lib/helpers/utils";

export type LikeMutationAction = "like" | "unlike";

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
