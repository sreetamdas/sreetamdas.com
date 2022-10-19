import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { ShikiPlayground } from "@/components/shiki";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const ShikiPage = () => (
	<>
		<DocumentHead title="Shiki" />
		<Space />
		<Center>
			<Title $size={5}>/shiki</Title>
		</Center>

		<ShikiPlayground />

		<ViewsCounter />
	</>
);

export default ShikiPage;
