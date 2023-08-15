"use client";

import { motion, useTransform, useScroll } from "framer-motion";

export const ReadingProgress = () => {
	const { scrollYProgress } = useScroll();
	const progressValue = useTransform(scrollYProgress, (value) => `${value * 100}%`);

	return (
		<motion.span
			className="fixed left-0 top-0 z-20 h-1 bg-gradient-to-r from-primary to-secondary duration-200 ease-out"
			style={{ width: progressValue }}
		/>
	);
};
