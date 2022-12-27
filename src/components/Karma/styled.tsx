import * as SwitchPrimitive from "@radix-ui/react-switch";
import Image, { ImageProps } from "next/image";
import styled, { css } from "styled-components";

import { sharedTransition } from "@/styles/components";
import { FullWidthWrapper } from "@/styles/layouts";
import { breakpoint, pixelToRem } from "@/utils/style";

export const KARMA_COLOR_PALETTE = [
	"#FC618D",
	"#51C7DA",
	"#AF98E6",
	"#E3CF65",
	"#7BD88F",
	"#FD9353",
] as const;
export const KARMA_LIGHT_COLOR_PALETTE = [
	"#FC618D",
	"#5688C7",
	"#6F42C1",
	"#FFAA33",
	"#2D972F",
	"#FA8D3E",
] as const;
type KarmaColors = typeof KARMA_COLOR_PALETTE[number] | typeof KARMA_LIGHT_COLOR_PALETTE[number];

export const StyledImage = (props: ImageProps) => (
	<FullScreenImage>
		<Image {...props} alt={props.alt} quality={100} placeholder={"blur"} unoptimized />
	</FullScreenImage>
);

export const MainTitle = styled.h1`
	font-size: clamp(1rem, 8rem, 20vw);
	padding: 0;
	line-height: 1;
`;

export const FullScreenImage = styled.div`
	margin-top: -1.5rem;
	justify-self: center;
	border-radius: var(--border-radius);

	&,
	> img {
		max-width: 75vw;
		width: 100%;
		height: auto;

		${breakpoint.until.sm(css`
			max-width: 95vw;
		`)}
	}
`;

export const TableOfContentsWrapper = styled.div`
	display: flex;
	gap: 30px;
	padding-bottom: 50px;

	> p {
		margin: 0;

		${breakpoint.from.sm(css`
			flex-shrink: 0;
		`)}
	}
`;

export const TableOfContents = styled.ul`
	display: flex;
	flex-wrap: wrap;
	margin: 0;
	padding: 0;
	column-gap: 30px;
	row-gap: 10px;

	li {
		display: inline;
		list-style: none;
	}
`;

export const SwitchWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;
export const SwitchLabel = styled.label`
	font-size: ${pixelToRem(16)};
`;
export const Switch = styled(SwitchPrimitive.Root)`
	height: 25px;
	width: 42px;
	margin: 0 15px;

	position: relative;
	border: unset;
	padding: unset;
	border-radius: 5000px;
	background-color: var(--color-primary-accent);
	cursor: pointer;
`;
export const SwitchThumb = styled(SwitchPrimitive.Thumb)`
	display: block;
	width: 21px;
	height: 21px;
	background-color: white;
	border-radius: 50%;

	transform: translateX(2px);
	${sharedTransition("transform")}

	&[data-state="checked"] {
		transform: translateX(19px);
	}
`;

export const WideImagesContainer = styled(FullWidthWrapper)`
	display: flex;
	flex-direction: column;
	row-gap: 100px;
	padding-top: 100px;
`;

export const CodeExampleWrapper = styled.article`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const ColorPaletteWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding-top: 50px;

	${breakpoint.until.sm(css`
		justify-content: center;
	`)}
`;

export const ColorPaletteBlock = styled.div<{ $color: KarmaColors; $isDefaultTheme: boolean }>`
	display: grid;
	place-content: center;

	color: ${({ $isDefaultTheme }) => ($isDefaultTheme ? "#000" : "#FFF")};
	background-color: ${({ $color }) => $color};

	font-family: var(--font-family-code);

	height: 7rem;
	width: 5rem;
	border-radius: var(--border-radius);
`;

export const LinksContainer = styled.div`
	display: flex;
	gap: 5rem;
	justify-content: center;
	padding: 40px 0;
`;
