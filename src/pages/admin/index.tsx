import { Button } from "@/components/Button";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { OWNER, SITE_URL } from "@/config";
import { getSupabaseClient, useSupabaseSession } from "@/domains/Supabase";
import { Center, Space } from "@/styles/layouts";
import { Paragraph, Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

const Admin = () => {
	const hasMounted = useHasMounted();
	const { enabled: supabaseEnabled, supabaseClient } = getSupabaseClient();
	const { isLoading, session } = useSupabaseSession();

	async function handleSignInWithGitHub() {
		if (supabaseEnabled) {
			await supabaseClient.auth.signInWithOAuth({
				provider: "github",
				options: {
					redirectTo: `${SITE_URL}/admin`,
				},
			});
		}
	}

	if (!hasMounted || isLoading) {
		return null;
	}

	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title $size={5}>/admin</Title>

				<Space />

				{!session ? (
					<Button onClick={handleSignInWithGitHub}>Sign in with GitHub</Button>
				) : session.user?.email !== OWNER ? (
					<Paragraph>Oops, you don&apos;t have access to that. Sorry!</Paragraph>
				) : null}
			</Center>

			<ViewsCounter />
		</>
	);
};

export default Admin;
