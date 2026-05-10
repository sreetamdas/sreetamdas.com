/**
 * Custom slide deck components that replace @nkzw/remdx.
 *
 * Uses Tailwind for all styling instead of the global CSS that was leaking
 * into the rest of the site. Supports keyboard navigation and basic slide
 * transitions.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface SlideData {
	theme?: string;
	transition?: string;
	image?: string;
	[key: string]: string | undefined;
}

export interface Slide {
	Component: () => ReactNode;
	data: SlideData;
}

interface SlideDeckProps {
	slides: Slide[];
	className?: string;
	style?: CSSProperties;
}

/**
 * SlideDeck manages keyboard navigation and renders the current slide.
 *
 * Keyboard shortcuts:
 * - Left arrow / Page Up: previous slide
 * - Right arrow / Page Down / Space: next slide
 */
export function SlideDeck({ slides, className, style }: SlideDeckProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const containerRef = useRef<HTMLDivElement>(null);

	const goTo = useCallback(
		(index: number) => {
			if (index < 0 || index >= slides.length) return;
			setDirection(index > currentIndex ? "forward" : "backward");
			setCurrentIndex(index);
		},
		[currentIndex, slides.length],
	);

	const goNext = useCallback(() => {
		goTo(currentIndex + 1);
	}, [currentIndex, goTo]);

	const goPrev = useCallback(() => {
		goTo(currentIndex - 1);
	}, [currentIndex, goTo]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			switch (event.key) {
				case "ArrowLeft":
				case "PageUp":
					event.preventDefault();
					goPrev();
					break;
				case "ArrowRight":
				case "PageDown":
				case " ":
					event.preventDefault();
					goNext();
					break;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goNext, goPrev]);

	return (
		<div
			ref={containerRef}
			className={`relative h-full w-full overflow-hidden bg-white dark:bg-gray-900 ${className ?? ""}`}
			style={style}
			tabIndex={0}
			role="region"
			aria-label="Slide deck"
		>
			{slides.map((slide, index) => (
				<SlideWrapper
					key={index}
					isActive={index === currentIndex}
					direction={direction}
					data={slide.data}
				>
					<slide.Component />
				</SlideWrapper>
			))}

			{/* Slide counter */}
			<div className="absolute bottom-4 right-4 z-20 text-sm text-gray-500 dark:text-gray-400">
				{currentIndex + 1} / {slides.length}
			</div>
		</div>
	);
}

interface SlideWrapperProps {
	children: ReactNode;
	isActive: boolean;
	direction: "forward" | "backward";
	data: SlideData;
}

function SlideWrapper({ children, isActive, direction, data }: SlideWrapperProps) {
	const translateClass = isActive
		? "translate-x-0 opacity-100 z-10"
		: direction === "forward"
			? "-translate-x-full opacity-0 -z-10"
			: "translate-x-full opacity-0 -z-10";

	return (
		<div
			className={`absolute inset-0 transition-all duration-500 ease-in-out ${translateClass}`}
			style={
				data.image
					? {
							backgroundImage: `url('${data.image}')`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}
					: undefined
			}
			aria-hidden={!isActive}
		>
			<div className="h-full w-full overflow-auto p-12">{children}</div>
		</div>
	);
}
