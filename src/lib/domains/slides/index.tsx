/**
 * Custom slide deck components that replace @nkzw/remdx.
 *
 * Uses Tailwind for all styling instead of the global CSS that was leaking
 * into the rest of the site. Supports keyboard navigation, basic slide
 * transitions, and presenter mode with speaker notes.
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
	notes: string | null;
}

interface SlideDeckProps {
	slides: Slide[];
	className?: string;
	style?: CSSProperties;
	presenterMode?: boolean;
}

/**
 * SlideDeck manages keyboard navigation and renders the current slide.
 *
 * Keyboard shortcuts:
 * - Left arrow / Page Up: previous slide
 * - Right arrow / Page Down / Space: next slide
 * - p: toggle presenter mode
 */
export function SlideDeck({ slides, className, style, presenterMode: initialPresenterMode = false }: SlideDeckProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const [presenterMode, setPresenterMode] = useState(initialPresenterMode);
	const [elapsedTime, setElapsedTime] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>();

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
				case "p":
				case "P":
					event.preventDefault();
					setPresenterMode((prev) => !prev);
					break;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goNext, goPrev]);

	// Timer for presenter mode
	useEffect(() => {
		if (presenterMode) {
			timerRef.current = setInterval(() => {
				setElapsedTime((prev) => prev + 1);
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [presenterMode]);

	if (presenterMode) {
		return (
			<PresenterMode
				slides={slides}
				currentIndex={currentIndex}
				elapsedTime={elapsedTime}
				goTo={goTo}
				goNext={goNext}
				goPrev={goPrev}
				direction={direction}
			/>
		);
	}

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

interface PresenterModeProps {
	slides: Slide[];
	currentIndex: number;
	elapsedTime: number;
	goTo: (index: number) => void;
	goNext: () => void;
	goPrev: () => void;
	direction: "forward" | "backward";
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function PresenterMode({ slides, currentIndex, elapsedTime, goTo, goNext, goPrev, direction }: PresenterModeProps) {
	const currentSlide = slides[currentIndex];
	const nextSlide = slides[currentIndex + 1];
	const progress = ((currentIndex + 1) / slides.length) * 100;

	return (
		<div className="flex h-screen flex-col bg-gray-900 text-white">
			{/* Top bar: Timer and progress */}
			<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
				<div className="text-lg font-mono">{formatTime(elapsedTime)}</div>
				<div className="flex-1 px-8">
					<div className="h-2 rounded-full bg-gray-700">
						<div
							className="h-full rounded-full bg-blue-500 transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
				<div className="text-sm text-gray-400">
					{currentIndex + 1} / {slides.length}
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-1 gap-4 p-4">
				{/* Current slide */}
				<div className="flex flex-[2] flex-col">
					<div className="mb-2 text-xs uppercase tracking-wider text-gray-400">Current Slide</div>
					<div className="flex-1 overflow-hidden rounded-lg bg-black">
						<div className="h-full w-full overflow-auto p-8">
							<currentSlide.Component />
						</div>
					</div>
				</div>

				{/* Right column: Next slide + Notes */}
				<div className="flex flex-1 flex-col gap-4">
					{/* Next slide preview */}
					<div className="flex flex-1 flex-col">
						<div className="mb-2 text-xs uppercase tracking-wider text-gray-400">Next Slide</div>
						<div className="flex-1 overflow-hidden rounded-lg bg-black">
							{nextSlide ? (
								<div className="h-full w-full overflow-auto p-4 opacity-70">
									<nextSlide.Component />
								</div>
							) : (
								<div className="flex h-full items-center justify-center text-gray-500">End of deck</div>
							)}
						</div>
					</div>

					{/* Speaker notes */}
					<div className="flex-1 flex-col">
						<div className="mb-2 text-xs uppercase tracking-wider text-gray-400">Speaker Notes</div>
						<div className="flex-1 overflow-auto rounded-lg bg-gray-800 p-4">
							{currentSlide.notes ? (
								<div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
									{currentSlide.notes}
								</div>
							) : (
								<div className="text-gray-500 italic">No notes for this slide</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Bottom bar: Navigation controls */}
			<div className="flex items-center justify-center gap-4 border-t border-gray-700 px-4 py-3">
				<button
					onClick={goPrev}
					disabled={currentIndex === 0}
					className="rounded bg-gray-700 px-4 py-2 text-sm transition-colors hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700"
				>
					Previous
				</button>

				{/* Quick jump buttons */}
				<div className="flex max-w-md gap-1 overflow-x-auto">
					{slides.map((_, index) => (
						<button
							key={index}
							onClick={() => goTo(index)}
							className={`h-8 w-8 rounded text-xs transition-colors ${
								index === currentIndex
									? "bg-blue-500 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							{index + 1}
						</button>
					))}
				</div>

				<button
					onClick={goNext}
					disabled={currentIndex === slides.length - 1}
					className="rounded bg-gray-700 px-4 py-2 text-sm transition-colors hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700"
				>
					Next
				</button>
			</div>
		</div>
	);
}
