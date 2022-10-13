import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import { UploadBook } from "@/components/Books/UploadBook";
import { Button } from "@/components/Button";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { OWNER, SITE_URL } from "@/config";
import { Center, Space } from "@/styles/layouts";
import { Paragraph, Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

type AdminLoginProps = { unauthorizedUser?: boolean };
const AdminLogin = ({ unauthorizedUser }: AdminLoginProps) => {
	const supabaseClient = useSupabaseClient();

	async function handleSignInWithGitHub() {
		await supabaseClient.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo: `${SITE_URL}/admin`,
			},
		});
	}

	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title $size={5}>/admin</Title>
				<Space />

				{unauthorizedUser ? (
					<Paragraph>Oops, you don&apos;t have access to that. Sorry!</Paragraph>
				) : (
					<Button onClick={handleSignInWithGitHub}>Sign in with GitHub</Button>
				)}
			</Center>
			<ViewsCounter />
		</>
	);
};

const Admin = () => {
	const hasMounted = useHasMounted();
	const { isLoading, session } = useSessionContext();

	if (!hasMounted || isLoading) {
		return null;
	}
	if (!session) {
		return <AdminLogin />;
	}
	if (session.user?.email !== OWNER) {
		return <AdminLogin unauthorizedUser />;
	}

	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title $size={5}>/admin</Title>

				<UploadBook />
			</Center>
			<ViewsCounter />
		</>
	);
};

export default Admin;
