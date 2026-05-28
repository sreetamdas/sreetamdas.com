type PublishableContent = {
	published: boolean;
};

type RoutableRootContent = PublishableContent & {
	skip_page?: boolean;
};

type VisibilityOptions = {
	includeDrafts: boolean;
};

export function shouldServeBlogPost(
	post: PublishableContent,
	{ includeDrafts }: VisibilityOptions,
) {
	return includeDrafts || post.published;
}

export function shouldServeRootPage(
	page: RoutableRootContent,
	{ includeDrafts }: VisibilityOptions,
) {
	if (page.skip_page) {
		return false;
	}

	return includeDrafts || page.published;
}
