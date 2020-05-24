import styled from "styled-components";

export const BlogPostsPreviewLayout = styled.div`
	width: 100%;
	display: grid;
	max-width: 550px;
	grid-gap: 1rem;
`;

export const Layout = styled.div`
	/* padding: 0 200px; */
	max-width: 550px;
`;

export const Center = styled.div`
	display: grid;
	justify-items: center;
	/* grid-column: 2; */
`;

export const MDXText = styled.div`
	line-height: 1.4;
	margin: 0; /* thanks @mxstbr! */
	padding: 15px 0;
`;

export const RemoveBullterFromOL = styled.div`
	& ul {
		list-style: none;
		padding-left: 30px;
	}
	& ul li {
		padding: 5px;
	}
`;
