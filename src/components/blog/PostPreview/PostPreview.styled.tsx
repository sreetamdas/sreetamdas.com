import styled from "styled-components";

import { primaryGradientMixin } from "@/styles/typography";

export const PreviewCard = styled.article`
	> a:hover {
		text-decoration: none;
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

export const PostPreviewTitle = styled.h3<{ $isHovered: boolean }>`
	margin: 0;
	padding: 0;
	font-size: 2rem;
	color: var(--color-primary-accent);
	${({ $isHovered }) => $isHovered && primaryGradientMixin}

	:hover {
		${primaryGradientMixin}
	}
`;
export const PostPreviewSummary = styled.p`
	margin: 0;
`;

export const ReadMorePrompt = styled.p`
	font-size: 0.85rem;
	margin: 0;
`;
