import { getHotkeyManager } from "@tanstack/hotkeys";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";

/**
 * Custom slide deck components that replace @nkzw/remdx.
 *
 * Uses Tailwind for all styling instead of the global CSS that was leaking
 * into the rest of the site. Supports keyboard navigation, slide transitions,
 * presenter mode with speaker notes, URL-synced position, and step indices.
 */
import { Gradient } from "@/lib/components/Typography";
import { cn } from "@/lib/helpers/utils";

import { useAspectRatioFitting } from "./use-aspect-ratio-fitting";

export interface SlideData {
	title?: string;
	theme?: string;
	transition?: string;
	image?: string;
	[key: string]: string | undefined;
}

export interface Slide {
	Component: (props: { stepIndex?: number }) => ReactNode;
	stepCount: number;
	data: SlideData;
	notes: string | null;
}

interface SlideDeckProps {
	slides: Slide[];
	className?: string;
	style?: CSSProperties;
	presenterMode?: boolean;
	swipeEnabled?: boolean;
	aspectRatio?: number;
	initialSlide?: number;
	initialStep?: number;
	onNavigate?: (slide: number, step: number) => void;
}

/**
 * SlideDeck manages keyboard navigation and renders the current slide.
 *
 * Keyboard shortcuts:
 * - Left arrow / Page Up: previous slide or step
 * - Right arrow / Page Down / Space: next slide or step
 * - Alt+B: toggle presenter mode
 */
export function SlideDeck({
	slides,
	className,
	style,
	presenterMode: initialPresenterMode = false,
	swipeEnabled = true,
	aspectRatio = 16 / 9,
	initialSlide = 0,
	initialStep = 0,
	onNavigate,
}: SlideDeckProps) {
	const [currentIndex, setCurrentIndex] = useState(() => {
		const safe = Math.max(0, Math.min(initialSlide, slides.length - 1));
		return safe;
	});
	const [currentStep, setCurrentStep] = useState(() => {
		const slide = slides[Math.max(0, Math.min(initialSlide, slides.length - 1))];
		const maxStep = slide ? slide.stepCount - 1 : 0;
		return Math.max(0, Math.min(initialStep, maxStep));
	});
	const [presenterMode, setPresenterMode] = useState(initialPresenterMode);
	const [elapsedTime, setElapsedTime] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
	const touchStartX = useRef<number>(0);
	const [containerRefFit, fitStyle] = useAspectRatioFitting(aspectRatio);

	const currentSlide = slides[currentIndex];
	const maxStep = currentSlide ? currentSlide.stepCount - 1 : 0;

	const goTo = useCallback(
		(index: number, step = 0) => {
			if (index < 0 || index >= slides.length) return;
			const targetSlide = slides[index];
			const safeStep = Math.max(0, Math.min(step, targetSlide.stepCount - 1));
			setCurrentIndex(index);
			setCurrentStep(safeStep);
			onNavigate?.(index, safeStep);
		},
		[slides, onNavigate],
	);

	const stepForward = useCallback(() => {
		if (currentStep < maxStep) {
			setCurrentStep((s) => s + 1);
			onNavigate?.(currentIndex, currentStep + 1);
		} else if (currentIndex < slides.length - 1) {
			setCurrentIndex((i) => i + 1);
			setCurrentStep(0);
			onNavigate?.(currentIndex + 1, 0);
		}
	}, [currentStep, maxStep, currentIndex, slides.length, onNavigate]);

	const stepBackward = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((s) => s - 1);
			onNavigate?.(currentIndex, currentStep - 1);
		} else if (currentIndex > 0) {
			const prevSlide = slides[currentIndex - 1];
			const prevStep = prevSlide.stepCount - 1;
			setCurrentIndex((i) => i - 1);
			setCurrentStep(prevStep);
			onNavigate?.(currentIndex - 1, prevStep);
		}
	}, [currentStep, currentIndex, slides, onNavigate]);

	const togglePresenterMode = useCallback(() => {
		setPresenterMode((prev) => !prev);
	}, []);

	const goNextRef = useRef(stepForward);
	const goPrevRef = useRef(stepBackward);
	const togglePresenterRef = useRef(togglePresenterMode);

	goNextRef.current = stepForward;
	goPrevRef.current = stepBackward;
	togglePresenterRef.current = togglePresenterMode;

	useEffect(() => {
		containerRef.current?.focus();
	}, []);

	useEffect(() => {
		const manager = getHotkeyManager();

		const handles = [
			manager.register("ArrowLeft", () => goPrevRef.current(), { preventDefault: true }),
			manager.register("ArrowRight", () => goNextRef.current(), { preventDefault: true }),
			manager.register("PageUp", () => goPrevRef.current(), { preventDefault: true }),
			manager.register("PageDown", () => goNextRef.current(), { preventDefault: true }),
			manager.register("Space", () => goNextRef.current(), { preventDefault: true }),
			manager.register("Alt+B", () => togglePresenterRef.current(), { preventDefault: true }),
		];

		return () => {
			handles.forEach((h) => h.unregister());
		};
	}, []);

	const handleTouchStart = useCallback((event: React.TouchEvent) => {
		touchStartX.current = event.touches[0].clientX;
	}, []);

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent) => {
			if (!swipeEnabled) return;
			const deltaX = event.changedTouches[0].clientX - touchStartX.current;
			const threshold = 50;
			if (deltaX > threshold) {
				goPrevRef.current();
			} else if (deltaX < -threshold) {
				goNextRef.current();
			}
		},
		[swipeEnabled],
	);

	useEffect(() => {
		if (presenterMode) {
			timerRef.current = setInterval(() => {
				setElapsedTime((prev) => prev + 1);
			}, 1000);
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
				currentStep={currentStep}
				elapsedTime={elapsedTime}
				goTo={goTo}
				goNext={stepForward}
				goPrev={stepBackward}
			/>
		);
	}

	const totalSteps = slides.reduce((sum, s) => sum + s.stepCount, 0);
	const globalStepIndex =
		slides.slice(0, currentIndex).reduce((sum, s) => sum + s.stepCount, 0) + currentStep;

	return (
		<div
			ref={containerRef}
			className={cn("relative h-full w-full overflow-hidden", className)}
			style={style}
			tabIndex={0}
			role="region"
			aria-label="Slide deck"
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			<div ref={containerRefFit} className="h-full w-full">
				<div style={fitStyle}>
					{slides.map((slide, index) => (
						<SlideWrapper
							key={index}
							isActive={index === currentIndex}
							isBefore={index < currentIndex}
							data={slide.data}
						>
							<slide.Component stepIndex={currentStep} />
						</SlideWrapper>
					))}

					<div className="absolute right-4 bottom-4 z-20 text-sm text-gray-500 dark:text-gray-400">
						{globalStepIndex + 1} / {totalSteps}
					</div>
				</div>
			</div>
		</div>
	);
}

interface SlideWrapperProps {
	children: ReactNode;
	isActive: boolean;
	isBefore: boolean;
	data: SlideData;
}

function SlideWrapper({ children, isActive, isBefore, data }: SlideWrapperProps) {
	const translateClass = isActive
		? "translate-x-0 opacity-100 z-10"
		: isBefore
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
			<div className="h-full w-full overflow-auto p-12">
				{data.title && (
					<h1 className="pt-10 font-serif text-8xl font-bold tracking-tighter text-balance">
						<Gradient className="">{data.title}</Gradient>
					</h1>
				)}
				{children}
			</div>
		</div>
	);
}

interface PresenterModeProps {
	slides: Slide[];
	currentIndex: number;
	currentStep: number;
	elapsedTime: number;
	goTo: (index: number, step?: number) => void;
	goNext: () => void;
	goPrev: () => void;
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function PresenterMode({
	slides,
	currentIndex,
	currentStep,
	elapsedTime,
	goTo,
	goNext,
	goPrev,
}: PresenterModeProps) {
	const currentSlide = slides[currentIndex];
	const nextSlide = slides[currentIndex + 1];
	const totalSteps = slides.reduce((sum, s) => sum + s.stepCount, 0);
	const globalStepIndex =
		slides.slice(0, currentIndex).reduce((sum, s) => sum + s.stepCount, 0) + currentStep;
	const progress = ((globalStepIndex + 1) / totalSteps) * 100;

	return (
		<div className="flex h-screen flex-col bg-gray-900 text-white">
			<div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
				<div className="font-mono text-lg">{formatTime(elapsedTime)}</div>
				<div className="flex-1 px-8">
					<div className="h-2 rounded-full bg-gray-700">
						<div
							className="h-full rounded-full bg-blue-500 transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
				<div className="text-sm text-gray-400">
					{globalStepIndex + 1} / {totalSteps}
				</div>
			</div>

			<div className="flex flex-1 gap-4 p-4">
				<div className="flex flex-2 flex-col">
					<div className="mb-2 text-xs tracking-wider text-gray-400 uppercase">Current Slide</div>
					<div className="flex-1 overflow-hidden rounded-lg bg-black">
						<div className="h-full w-full overflow-auto p-8">
							<currentSlide.Component stepIndex={currentStep} />
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-4">
					<div className="flex flex-1 flex-col">
						<div className="mb-2 text-xs tracking-wider text-gray-400 uppercase">Next Slide</div>
						<div className="flex-1 overflow-hidden rounded-lg bg-black">
							{nextSlide ? (
								<div className="h-full w-full overflow-auto p-4 opacity-70">
									<nextSlide.Component stepIndex={0} />
								</div>
							) : (
								<div className="flex h-full items-center justify-center text-gray-500">
									End of deck
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-1 flex-col">
						<div className="mb-2 text-xs tracking-wider text-gray-400 uppercase">Speaker Notes</div>
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

			<div className="flex items-center justify-center gap-4 border-t border-gray-700 px-4 py-3">
				<button
					onClick={goPrev}
					disabled={currentIndex === 0 && currentStep === 0}
					className="rounded bg-gray-700 px-4 py-2 text-sm transition-colors hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700"
				>
					Previous
				</button>

				<div className="flex max-w-md gap-1 overflow-x-auto">
					{slides.map((_slide, index) => (
						<button
							key={index}
							onClick={() => goTo(index, 0)}
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
					disabled={
						currentIndex === slides.length - 1 &&
						currentStep === slides[slides.length - 1]?.stepCount - 1
					}
					className="rounded bg-gray-700 px-4 py-2 text-sm transition-colors hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700"
				>
					Next
				</button>
			</div>
		</div>
	);
}
