import { FormEvent, useState } from "react";
import styled, { css } from "styled-components";

import { buttonStylesMixin } from "components/foobar/styled";
import { sharedTransition } from "styles/components";
import { Accent } from "styles/typography";
import { breakpoint } from "utils/style";

export type TNewsletterProps = {
	subscriberCount: number;
};
export const Newsletter = ({ subscriberCount }: TNewsletterProps) => {
	const [formSuccess, setFormSuccess] = useState(false);
	const [isFormBeingSubmitted, setIsFormBeingSubmitted] = useState(false);
	const [formError, setFormError] = useState<string>();

	const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
	};
	return (
		<Grid>
			<NewsletterTitle>Sign up for my newsletter!</NewsletterTitle>
			<NewsletterText>
				I curate links keeping up with the JavaScript, React and webdev world. Join{" "}
				<Accent>{subscriberCount}</Accent> others!
				<br />
				May include Mechanical Keyboards.
				<br />
				<br />
				No spam, unsubscribe anytime :&#41;
				<br />
				You can also <a href="https://buttondown.email/sreetamdas/archive">view previous issues</a>,
				and <a href="https://buttondown.email/sreetamdas/rss">subscribe via RSS</a>!
			</NewsletterText>
			<div>
				<StyledForm onSubmit={handleFormSubmit}>
					<StyledLabel htmlFor="bd-email">Email</StyledLabel>
					<StyledInput type="email" name="email" id="bd-email" required />
					<input type="hidden" value="1" name="embed" />
					<SubscribeButton value="Subscribe" disabled={isFormBeingSubmitted} />
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

const StyledInput = styled.input.attrs({
	placeholder: "sreetam@sreetamdas.com",
})`
	font-size: 16px;
	background-color: var(--color-background);
	color: var(--color-primary);
	padding: 10px;
	border: 2px solid var(--color-primary-accent);
	border-radius: var(--border-radius);
	grid-column: 1 / span 2;

	${sharedTransition("color, background-color")}
`;

const SubscribeButton = styled.input.attrs({ type: "submit" })<{
	disabled: boolean;
}>`
	${buttonStylesMixin}
	font-size: 16px;
	padding: 0;
	align-self: baseline;
	grid-column: 2;

	${breakpoint.from.md(css`
		grid-column: 1;
	`)}

	${({ disabled }) =>
		disabled &&
		css`
			cursor: not-allowed;
			opacity: 0.5;
		`}
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
