import { FoobarSchrodinger } from "pages/foobar";
import { useRouter } from "next/router";

type TRouterFoobarQuery = {
	query: {
		page: string;
	};
};

const Index = () => {
	const router = useRouter();
	const {
		query: { page },
	} = (router as unknown) as TRouterFoobarQuery;

	return <FoobarSchrodinger completedPage={page} />;
};
export default Index;
