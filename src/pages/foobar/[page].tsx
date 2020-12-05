import { useRouter } from "next/router";

import { FOOBAR_PAGES } from "components/foobar/badges";
import { FoobarSchrodinger } from "components/foobar/pages";
import Custom404 from "pages/404";

type TRouterFoobarQuery = {
	query: {
		page: TFoobarPages;
	};
};

const Index = () => {
	const router = useRouter();
	const {
		query: { page },
	} = (router as unknown) as TRouterFoobarQuery;

	if (!Object.values(FOOBAR_PAGES).includes(page)) return <Custom404 />;

	// activate offline page only when, well, user is offline
	if (page === "offline" && navigator.onLine)
		return <Custom404 message="pssst try going offline" />;

	return <FoobarSchrodinger completedPage={page} />;
};
export default Index;
