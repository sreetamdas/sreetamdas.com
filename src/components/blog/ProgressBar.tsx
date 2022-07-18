import { motion, useTransform, useScroll } from "framer-motion";
import styled from "styled-components";

const ProgressBar = styled(motion.div)`
	position: fixed;
	left: 0;
	top: 0;
	background: linear-gradient(
		90deg,
		var(--color-primary-accent) 0%,
		var(--color-secondary-accent) 100%
	);
	height: 5px;
	transition: 0.2s ease;
	z-index: 3;
`;

export const ReadingProgress = () => {
	const { scrollYProgress } = useScroll();
	const progressValue = useTransform(scrollYProgress, (value) => `${value * 100}%`);

	return <ProgressBar style={{ width: progressValue }} />;
};
