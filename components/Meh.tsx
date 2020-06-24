import { useState, useEffect } from "react";
import { ProgressBar } from "components/styled/blog";

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
