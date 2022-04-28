import styled from "styled-components";

import { primaryGradientMixin, StyledLink } from "@/styles/typography";
import { pixelToRem } from "@/utils/style";

export const PreviewCard = styled.article`
	display: grid;
	row-gap: 10px;
`;

export const ExtraInfoWrapper = styled.div`
	display: flex;
	justify-content: space-between;

	${StyledLink} {
		font-size: ${pixelToRem(16)};
		:hover {
			text-decoration: none;
		}
	}
`;
export const PreviewMetadata = styled.p`
	font-size: ${pixelToRem(16)};
	margin: 0;
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
