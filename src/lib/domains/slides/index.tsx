import { getHotkeyManager } from "@tanstack/hotkeys";
/**
 * Custom slide deck renderer — replaces @nkzw/remdx.
 *
 * Steps are handled at runtime by the <Steps> component, which progressively
 * reveals children within a single slide. There is no build-time step splitting;
 * each slide is one MDX parse. Key differences from remdx: Tailwind-only styling,
 * @tanstack/hotkeys instead of mousetrap, native touch handling instead of
 * react-swipeable, and CSS zoom + container queries for aspect-ratio fitting
 * (no JS layout shift).
 */
import { type MDXComponents } from "mdx/types";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";

import { MDXContent } from "@/lib/components/MDX";
import { Gradient } from "@/lib/components/Typography";
import { cn } from "@/lib/helpers/utils";

import { StepContext, SlideActiveContext, type StepContextValue } from "./steps";
import { aspectRatioFittingStyles } from "./use-aspect-ratio-fitting";

export interface SlideData {
	title?: string;
	theme?: string;
	transition?: string;
	image?: string;
	[key: string]: string | undefined;
}

export interface Slide {
	content: string;
	mdast: string;
	shikiHighlights: Record<string, string>;
	data: SlideData;
	notes: string | null;
}

interface StepEntry {
	id: string;
	count: number;
}

interface SlideDeckProps {
	slides: Slide[];
	className?: string;
	style?: CSSProperties;
	presenterMode?: boolean;
	swipeEnabled?: boolean;
	transitions?: boolean;
	aspectRatio?: number;
	initialSlide?: number;
	initialStep?: number;
	onNavigate?: (slide: number, step: number) => void;
	components?: MDXComponents;
}

/**
 * SlideDeck manages keyboard navigation and renders the current slide.
 *
 * Keyboard shortcuts:
 * - Left arrow / Page Up: previous slide or step
 * - Right arrow / Page Down / Space: next slide or step
 * - Alt+B: toggle presenter mode
 * - Alt+T: toggle slide transitions
 */
export function SlideDeck({
	slides,
	className,
	style,
	presenterMode: initialPresenterMode = false,
	swipeEnabled = true,
	transitions: initialTransitions = true,
	aspectRatio = 16 / 9,
	initialSlide = 0,
	initialStep = 0,
	onNavigate,
	components,
}: SlideDeckProps) {
	const [currentIndex, setCurrentIndex] = useState(() =>
		Math.max(0, Math.min(initialSlide, slides.length - 1)),
	);
	const [currentStep, setCurrentStep] = useState(initialStep);
	const [presenterMode, setPresenterMode] = useState(initialPresenterMode);
	const [transitionsEnabled, setTransitionsEnabled] = useState(initialTransitions);
	const [elapsedTime, setElapsedTime] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
	const touchStartX = useRef<number>(0);
	const stepRegistrations = useRef<StepEntry[]>([]);
	const [_stepVersion, setStepVersion] = useState(0);
	const [fitContainerStyle, fitCanvasStyle] = aspectRatioFittingStyles(aspectRatio);

	const registerSteps = useCallback((count: number) => {
		const entry: StepEntry = { id: crypto.randomUUID(), count };
		stepRegistrations.current.push(entry);
		setStepVersion((v) => v + 1);
	}, []);

	const unregisterSteps = useCallback((id: string) => {
		stepRegistrations.current = stepRegistrations.current.filter((e) => e.id !== id);
		setStepVersion((v) => v + 1);
	}, []);

	useLayoutEffect(() => {
		stepRegistrations.current = [];
		setStepVersion((v) => v + 1);
	}, [currentIndex]);

	const dynamicMaxStep = stepRegistrations.current.reduce((sum, e) => sum + e.count, 0) - 1;
	const maxStep = dynamicMaxStep;

	const stepContextValue = useRef<StepContextValue>({
		currentStep: 0,
		registerSteps,
		unregisterSteps,
	});
	stepContextValue.current = { currentStep, registerSteps, unregisterSteps };

	const goTo = useCallback(
		(index: number, step = 0) => {
			if (index < 0 || index >= slides.length) return;
			setCurrentIndex(index);
			setCurrentStep(step);
			onNavigate?.(index, step);
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
			setCurrentIndex((i) => i - 1);
			setCurrentStep(0);
			onNavigate?.(currentIndex - 1, 0);
		}
	}, [currentStep, currentIndex, slides.length, onNavigate]);

	const togglePresenterMode = useCallback(() => {
		setPresenterMode((prev) => !prev);
	}, []);

	const toggleTransitions = useCallback(() => {
		setTransitionsEnabled((prev) => !prev);
	}, []);

	const goNextRef = useRef(stepForward);
	const goPrevRef = useRef(stepBackward);
	const togglePresenterRef = useRef(togglePresenterMode);
	const toggleTransitionsRef = useRef(toggleTransitions);

	goNextRef.current = stepForward;
	goPrevRef.current = stepBackward;
	togglePresenterRef.current = togglePresenterMode;
	toggleTransitionsRef.current = toggleTransitions;

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
			manager.register("Alt+T", () => toggleTransitionsRef.current(), { preventDefault: true }),
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
				components={components}
			/>
		);
	}

	return (
		<StepContext.Provider value={stepContextValue.current}>
			<div
				ref={containerRef}
				className={cn("relative h-full w-full overflow-hidden outline-none", className)}
				style={style}
				tabIndex={0}
				role="region"
				aria-label="Slide deck"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<div className="h-full w-full" style={fitContainerStyle}>
					<div style={fitCanvasStyle}>
						{slides.map((slide, index) => (
							<SlideActiveContext.Provider key={index} value={index === currentIndex}>
								<SlideWrapper
									isActive={index === currentIndex}
									isBefore={index < currentIndex}
									data={slide.data}
									transitions={transitionsEnabled}
								>
									<SlideRenderer slide={slide} components={components} />
								</SlideWrapper>
							</SlideActiveContext.Provider>
						))}

						<div className="absolute right-4 bottom-4 z-20 text-sm text-gray-500 dark:text-gray-400">
							{currentIndex + 1} / {slides.length}
						</div>
					</div>
				</div>
			</div>
		</StepContext.Provider>
	);
}

function SlideRenderer({ slide, components }: { slide: Slide; components?: MDXComponents }) {
	return (
		<MDXContent
			source={slide.content}
			mdast={slide.mdast}
			shikiHighlights={slide.shikiHighlights}
			components={components}
		/>
	);
}

interface SlideWrapperProps {
	children: ReactNode;
	isActive: boolean;
	isBefore: boolean;
	data: SlideData;
	transitions: boolean;
}

function SlideWrapper({ children, isActive, isBefore, data, transitions }: SlideWrapperProps) {
	const translateClass = isActive
		? "translate-x-0 opacity-100 z-10"
		: isBefore
			? "-translate-x-full opacity-0 -z-10"
			: "translate-x-full opacity-0 -z-10";

	return (
		<div
			className={cn(
				"absolute inset-0",
				translateClass,
				transitions && "transition-all duration-500 ease-in-out",
			)}
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
					<h1 className="pt-10 font-serif text-9xl font-bold text-balance whitespace-pre-line font-stretch-semi-condensed">
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
	components?: MDXComponents;
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
	components,
}: PresenterModeProps) {
	const currentSlide = slides[currentIndex];
	const nextSlide = slides[currentIndex + 1];
	const totalSteps = slides.length;
	const globalStepIndex = currentIndex;
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
							{currentSlide.data.title && (
								<h1 className="pt-10 font-serif text-7xl font-bold text-balance whitespace-pre-line font-stretch-semi-condensed">
									<Gradient className="">{currentSlide.data.title}</Gradient>
								</h1>
							)}
							<SlideRenderer slide={currentSlide} components={components} />
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-4">
					<div className="flex flex-1 flex-col">
						<div className="mb-2 text-xs tracking-wider text-gray-400 uppercase">Next Slide</div>
						<div className="flex-1 overflow-hidden rounded-lg bg-black">
							{nextSlide ? (
								<div className="h-full w-full overflow-auto p-4 opacity-70">
									<SlideRenderer slide={nextSlide} components={components} />
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
					disabled={currentIndex === slides.length - 1}
					className="rounded bg-gray-700 px-4 py-2 text-sm transition-colors hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700"
				>
					Next
				</button>
			</div>
		</div>
	);
}
