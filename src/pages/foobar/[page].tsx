import { ParsedUrlQuery } from "querystring";

import { GetStaticProps, InferGetStaticPropsType } from "next";

import { FoobarSchrodinger } from "@/components/foobar/pages";
import { FOOBAR_PAGES, FoobarPage } from "@/domains/Foobar";
import { useHasMounted } from "@/utils/hooks";
import Custom404 from "pages/404";

type FoobarPageProps = {
	page: Exclude<FoobarPage, "/">;
};
interface FoobarPageQuery extends ParsedUrlQuery {
	page: Exclude<FoobarPage, "/">;
}

const Index = ({ page }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const hasMounted = useHasMounted();
	if (!Object.values(FOOBAR_PAGES).includes(page)) return <Custom404 />;

	// activate offline page only when, well, user is offline
	if (page === "offline" && hasMounted && navigator.onLine)
		return <Custom404 message="pssst...try going offline" />;

	return <FoobarSchrodinger completedPage={page} />;
};
export default Index;

export const getStaticProps: GetStaticProps<FoobarPageProps, FoobarPageQuery> = async ({
	params,
}) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { page } = params!;
	return { props: { page } };
};

export async function getStaticPaths() {
	const allPages = Object.values(FOOBAR_PAGES);
	const paths = allPages.map((page) => ({ params: { page } }));

	return {
		paths,
		fallback: false,
	};
}
