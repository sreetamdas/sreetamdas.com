import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { UploadBook } from "@/components/Admin/UploadBook";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { Button } from "@/styles/Button";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";
import { supabaseClient } from "@/utils/supabaseClient";

const AdminLogin = () => {
	async function handleSignUpWIthGitHub() {
		await supabaseClient.auth.signIn(
			{
				provider: "github",
			},
			{ redirectTo: "/admin" }
		);
	}

	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title size={5}>/admin</Title>
				<Space />

				<button onClick={handleSignUpWIthGitHub}>Sign in with GitHub</button>
			</Center>
			<ViewsCounter />
		</>
	);
};

const Admin = () => {
	const hasMounted = useHasMounted();
	const [session, setSession] = useState<Session | null>(supabaseClient.auth.session());

	async function handleSignOut() {
		await supabaseClient.auth.signOut();
	}

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
	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title size={5}>/admin</Title>

				<Button onClick={handleSignOut} size="small">
					Sign out
				</Button>

				<UploadBook />
			</Center>
			<ViewsCounter />
		</>
	);
};

export default Admin;