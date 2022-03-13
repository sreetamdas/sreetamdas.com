import styled, { css } from "styled-components";

import { ImageWrapper } from "@/components/mdx/images";
import { fullWidthMixin } from "@/styles/layouts";
import { breakpoint, pixelToRem } from "@/utils/style";

export const SectionContainer = styled.section`
	display: flex;
	column-gap: 25px;
	row-gap: 100px;
	flex-wrap: wrap;
	justify-content: center;

	${fullWidthMixin}
	max-width: 90vw;

	margin: 0 auto;
	padding: 0 25px;
`;

export const BookWrapper = styled.div`
	display: inline-flex;
	gap: 10px;
	width: auto;

	flex-wrap: wrap;
	flex-direction: column;
	align-items: center;

	${breakpoint.until.sm(css`
		width: 100%;
		max-width: unset;
	`)}

	${ImageWrapper} {
		& > img {
			max-height: 450px;
		}
	}
`;

export const BookInfo = styled.div`
	max-width: 350px;
`;

export const BookTitle = styled.h3`
	padding-top: 0;
	font-size: ${pixelToRem(30)};
	white-space: pre-line;
`;
