import { useEffect } from "react";
import { Title } from "styles/blog";

export const Resume = () => {
	useEffect(() => {
		if (process.env.NODE_ENV === "production")
			window.location.href =
				"https://drive.google.com/file/u/2/d/121tFdPrPPImCeWJg0NMLVwBfpGc5RCnV/view";
	}, []);

	return <Title>Redirecting you to Google Drive</Title>;
};

export default Resume;
