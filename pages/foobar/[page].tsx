import { FoobarSchrodinger, FOOBAR_PAGES } from "pages/foobar";
import { useRouter } from "next/router";
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

	return <FoobarSchrodinger completedPage={page} />;
};
export default Index;
