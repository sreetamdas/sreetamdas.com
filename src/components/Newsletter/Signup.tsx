import { FormEvent, useState } from "react";
import styled, { css } from "styled-components";

import { Input, SubmitButton } from "@/components/Form";
import { Accent, LinkTo } from "@/styles/typography";
import { breakpoint } from "@/utils/style";

export type NewsletterProps = {
	subscriberCount: number;
	withNewsletter?: boolean;
};
export const NewsletterSignup = ({ subscriberCount, withNewsletter }: NewsletterProps) => {
	const [formSuccess, setFormSuccess] = useState(false);
	const [isFormBeingSubmitted, setIsFormBeingSubmitted] = useState(false);
	const [formError, setFormError] = useState<string>();

	async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
		setFormSuccess(false);
		setIsFormBeingSubmitted(true);
		setFormError(undefined);
		event.preventDefault();

		const data = new FormData(event.target as HTMLFormElement);
		const res = await fetch("https://buttondown.email/api/emails/embed-subscribe/sreetamdas", {
			body: data,
			method: "POST",
		});
		if (!res.ok) setFormError(await res.text());
		else setFormSuccess(true);

		setIsFormBeingSubmitted(false);
	}
	return (
		<Grid>
			<NewsletterTitle>Sign up for my newsletter!</NewsletterTitle>
			<NewsletterText>
				I curate links keeping up with the JavaScript, React and webdev world. Join{" "}
				<Accent>{subscriberCount}</Accent> others!
				<br />
				May include mechanical keyboards.
				<br />
				<br />
				No spam, unsubscribe anytime :&#41;
				<br />
				You can also{" "}
				{withNewsletter ? (
					<>view previous issues below</>
				) : (
					<LinkTo href="/newsletter">view previous issues</LinkTo>
				)}
				, and{" "}
				<LinkTo href="https://buttondown.email/sreetamdas/rss" target="_blank">
					subscribe via RSS
				</LinkTo>
				!
			</NewsletterText>
			<div>
				<StyledForm onSubmit={handleFormSubmit}>
					<StyledLabel htmlFor="bd-email">Email</StyledLabel>
					<StyledInput type="email" name="email" id="bd-email" required />
					<input type="hidden" value="1" name="embed" />
					<SubscribeButton isLoading={isFormBeingSubmitted}>Subscribe</SubscribeButton>
					<FormMessageContainer success={formSuccess}>
						{formError ? formError : null}
						{formSuccess ? "Thanks for signing up!" : null}
					</FormMessageContainer>
				</StyledForm>
			</div>
		</Grid>
	);
};

const Grid = styled.div`
	padding-top: 100px;
	display: grid;
	justify-content: stretch;
	grid-template-columns: 1fr;
	gap: 1rem;

	${breakpoint.from.md(css`
		grid-template-columns: 1fr 1fr;
	`)}
`;

const StyledForm = styled.form`
	width: 100%;
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 1rem;

	${breakpoint.from.md(css`
		grid-template-columns: 1fr 2fr;
	`)}
`;

const StyledInput = styled(Input).attrs({
	placeholder: "sreetam@sreetamdas.com",
})`
	background-color: var(--color-background);
	color: var(--color-primary);
	padding: 10px;

	grid-column: 1 / span 2;
`;

const SubscribeButton = styled(SubmitButton)`
	align-self: baseline;
	grid-column: 2;
	margin: 0;
	padding: 0 10px;

	${breakpoint.from.md(css`
		grid-column: 1;
	`)}
`;

const NewsletterTitle = styled.h2`
	padding: 0;
	font-size: 2rem;
	grid-column: 1 / -1;
`;

const FormMessageContainer = styled.p<{ success: boolean }>`
	color: var(${({ success }) => (success ? "--color-success-accent" : "--color-error")});
	padding: 0;
	margin: 0;
	font-size: 14px;
	display: grid;
	align-content: center;
	grid-column: 1;

	${breakpoint.from.md(css`
		grid-column: 2;
	`)}
`;

const NewsletterText = styled.div`
	font-size: 14px;
`;

const StyledLabel = styled.label`
	font-size: 12px;
	margin-bottom: -12px;
`;
