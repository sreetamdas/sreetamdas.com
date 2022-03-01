import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { UploadBook } from "@/components/Admin/UploadBook";
import { Button } from "@/components/Button";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
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

				<Button onClick={handleSignUpWIthGitHub}>Sign in with GitHub</Button>
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
	return (
		<>
			<DocumentHead title="Admin" noIndex />

			<Center>
				<Title size={5}>/admin</Title>

				<UploadBook />
			</Center>
			<ViewsCounter />
		</>
	);
};

export default Admin;
