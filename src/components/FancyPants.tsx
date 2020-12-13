import styled from "styled-components";

export const Typography = styled.h1`
	font-size: 3rem;
	color: var(--color-primary);
	line-height: 1.2;
`;

export const Highlighted = styled.span`
	font-size: clamp(4rem, 15vw, 8rem);
	color: var(--color-fancy-pants);
	transition: color 10s linear;
`;
