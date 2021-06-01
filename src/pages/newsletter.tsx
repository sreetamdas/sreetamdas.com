import axios from "axios";
import { GetStaticProps } from "next";
import { Fragment } from "react";

import { Newsletter, TNewsletterProps } from "components/blog/Newsletter";
import { DocumentHead } from "components/shared/seo";

const BUTTONDOWN_URL = "https://api.buttondown.email/v1/subscribers";
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

const Index = ({ subscriberCount }: TNewsletterProps) => {
	return (
		<Fragment>
			<DocumentHead title="Newsletter" />
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
	const BUTTONDOWN_AUTH_TOKEN = `Token ${BUTTONDOWN_API_KEY}`;

	const subscriberCount = (
		(
			await axios.get(BUTTONDOWN_URL, {
				headers: { Authorization: BUTTONDOWN_AUTH_TOKEN },
			})
		).data as TButtondownSubscribersAPIResponseObject
	).count;

	return {
		props: { subscriberCount },
	};
};

type TButtondownSubscribersAPIResponseObject = {
	count: number;
	next: null;
	previous: null;
	results: Array<{
		creation_date: string;
		email: string;
		id: string;
		notes: string;
		referrer_url: string;
		metadata: {};
		secondary_id: number;
		subscriber_type: string;
		source: string;
		tags: Array<string>;
		utm_campaign: string;
		utm_medium: string;
		utm_source: string;
	}>;
};
