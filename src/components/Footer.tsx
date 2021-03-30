import styled from "styled-components";

const Footer = () => {
	return (
		<FooterContent>
			Made with <a href="https://nextjs.org">Next.js</a> &bull; Hosted on{" "}
			<a href="https://netlify.com">Netlify</a> &bull; View source on{" "}
			<a href="https://github.com/sreetamdas/sreetamdas.com">Github</a>{" "}
			&bull; Find me on{" "}
			<a href="https://twitter.com/_SreetamDas">Twitter</a>
		</FooterContent>
	);
};

export { Footer };

const FooterContent = styled.div`
	font-size: 0.8rem;
`;
