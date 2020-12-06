import { useState, useEffect } from "react";
import styled from "styled-components";

const ProgressBar = styled.div<{ scroll: number }>`
	position: fixed;
	left: 0;
	background: linear-gradient(
		90deg,
		var(--color-primary-accent) 0%,
		var(--color-secondary-accent) 100%
	);
	width: ${({ scroll }) => scroll}%;
	height: 5px;
	transition: 0.2s ease;
	z-index: 3;
`;

export const ReadingProgress = () => {
	const [readingProgress, setReadingProgress] = useState(0);

	const calculateScrollDistance = () => {
		const scrollTop = window.pageYOffset; // how much the user has scrolled by
		const winHeight = window.innerHeight;
		const docHeight = getDocHeight();

		const totalDocScrollLength = docHeight - winHeight;
		const scrollPostion = Math.ceil(
			(scrollTop / totalDocScrollLength) * 100
		);
		return scrollPostion;
	};

	const getDocHeight = () => {
		return Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight,
			document.body.clientHeight,
			document.documentElement.clientHeight
		);
	};

	const scrollListener = () => {
		setReadingProgress(calculateScrollDistance());
	};

	useEffect(() => {
		window.addEventListener("scroll", scrollListener);
		return () => window.removeEventListener("scroll", scrollListener);
	});

	return <ProgressBar scroll={readingProgress} />;
};
