import styled from "styled-components";

import { primaryGradientMixin, StyledLinkBase } from "@/styles/typography";
import { pixelToRem } from "@/utils/style";

export const SectionWrapper = styled.section`
	display: grid;
	gap: 80px;
`;

export const PreviewWrapper = styled.article``;

export const PreviewSubject = styled.h2`
	color: var(--color-primary-accent);
	padding: 0;
	font-size: ${pixelToRem(24)};
	line-height: ${pixelToRem(30)};

	:hover {
		> ${StyledLinkBase} {
			${primaryGradientMixin}
		}
	}
`;

export const PreviewBody = styled.div`
	mask-image: linear-gradient(to bottom, black 50%, transparent 100%);

	& > h2,
	h3 {
		font-size: ${pixelToRem(20)};
	}

	& > p {
		margin: 10px 0;
		font-size: ${pixelToRem(16)};
	}

	img {
		max-width: var(--max-width);
		width: 100%;
		border-radius: var(--border-radius);
	}
`;

export const ExtraInfoWrapper = styled.div`
	padding-top: 10px;
	display: grid;
	justify-content: space-between;
	grid-template-columns: 1fr max-content;
`;
export const PreviewMetadata = styled.span`
	display: flex;
	align-items: center;
	gap: 20px;
`;
export const IconContainer = styled.span`
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: ${pixelToRem(16)};

	& > svg {
		font-size: ${pixelToRem(25)};
	}
`;

export const StatsLinkWrapper = styled.span`
	/* move to the right */
	margin-left: auto;
`;

export const IssueSubject = styled.h1`
	color: var(--color-primary-accent);
	padding: 0;
	font-size: ${pixelToRem(48)};
	line-height: ${pixelToRem(54)};
	margin-bottom: 50px;
`;

export const IssueContentWrapper = styled.article``;
