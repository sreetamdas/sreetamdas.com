import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { UploadBook } from "@/components/Admin/UploadBook";
import { Button } from "@/components/Button";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { OWNER, SITE_URL } from "@/config";
import { supabaseClient } from "@/domains/Supabase";
import { Center, Space } from "@/styles/layouts";
import { Paragraph, Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

type AdminLoginProps = { unauthorizedUser?: boolean };
const AdminLogin = ({ unauthorizedUser }: AdminLoginProps) => {
	async function handleSignInWithGitHub() {
		await supabaseClient.auth.signIn(
			{
				provider: "github",
			},
			{ redirectTo: `${SITE_URL}/admin` }
		);
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
	const [session, setSession] = useState<Session | null>(supabaseClient.auth.session());

	useEffect(() => {
		setSession(supabaseClient.auth.session());

		supabaseClient.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	if (!hasMounted) {
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
