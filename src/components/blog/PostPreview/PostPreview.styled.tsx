import styled, { css } from "styled-components";

import { primaryGradientMixin, StyledLink } from "@/styles/typography";
import { pixelToRem } from "@/utils/style";

export const PreviewCard = styled.article`
	display: grid;
	row-gap: 10px;
`;

export const ExtraInfoWrapper = styled.div`
	display: flex;
	justify-content: flex-start;
	column-gap: 25px;

	${StyledLink} {
		font-size: ${pixelToRem(14)};
		:hover {
			text-decoration: none;
		}
	}
`;
export const PreviewMetadata = styled.p`
	font-size: ${pixelToRem(14)};
	margin: 0;
`;

export const PostPreviewTitle = styled.h3<{ $isHovered: boolean }>`
	font-size: 2rem;
	line-height: 1.1;
	color: var(--color-primary-accent);
	margin: 0;
	padding: 0;

	${({ $isHovered }) =>
		$isHovered &&
		css`
			> ${StyledLink} {
				${primaryGradientMixin}
			}
		`}

	:hover {
		> ${StyledLink} {
			${primaryGradientMixin}
		}
	}
`;
export const PostPreviewSummary = styled.p`
	margin: 0;
	font-size: ${pixelToRem(16)};
`;
