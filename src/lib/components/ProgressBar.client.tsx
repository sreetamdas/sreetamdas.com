"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export const ReadingProgress = () => {
	const { scrollYProgress } = useScroll();
	const progressValue = useTransform(scrollYProgress, (value) => `${value * 100}%`);

	return (
		<motion.span
			className="fixed top-0 left-0 z-20 h-1 bg-gradient-to-r from-primary to-secondary duration-200 ease-out"
			style={{ width: progressValue }}
		/>
	);
};
