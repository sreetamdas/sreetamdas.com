import { KarmaShowcase } from "@/components/Karma";
import { MainTitle } from "@/components/Karma/styled";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const KarmaPage = () => (
	<>
		<DocumentHead
			title="Karma"
			imageURL="/karma/karma-card.jpg"
			description="A colorful VS Code theme by Sreetam Das"
		/>
		<Space />
		<Center>
			<MainTitle>Karma</MainTitle>
			<Title $size={3} $resetLineHeight $scaled>
				a colorful VS Code theme
			</Title>
		</Center>

		<KarmaShowcase />

		<ViewsCounter />
	</>
);

export default KarmaPage;
