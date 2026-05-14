/**
 * Runtime step system — replaces build-time -- delimiter splitting.
 *
 * The <Steps> component progressively reveals children within a single slide.
 * It registers its child count with the deck through StepContext so the deck
 * knows when to advance slides vs. reveal another step.
 *
 * SlideActiveContext prevents Steps on inactive (off-screen) slides from
 * registering, since all slides render at once for transition animations.
 */
import {
	Children,
	createContext,
	useContext,
	useEffect,
	useId,
	useRef,
	type ReactNode,
} from "react";

import { cn } from "@/lib/helpers/utils";

export interface StepContextValue {
	currentStep: number;
	registerSteps: (count: number) => void;
	unregisterSteps: (id: string) => void;
}

export const StepContext = createContext<StepContextValue>({
	currentStep: 0,
	registerSteps: () => {},
	unregisterSteps: () => {},
});

export const SlideActiveContext = createContext(false);

/**
 * Steps progressively reveals children one at a time.
 *
 * Each arrow press reveals the next child. When all children are visible and
 * there are no other Steps blocks with unrevealed children, the next press
 * advances to the next slide. Multiple <Steps> blocks on the same slide
 * accumulate sequentially — the second block's children follow the first's.
 */
export function Steps({ children }: { children: ReactNode }) {
	const { currentStep, registerSteps, unregisterSteps } = useContext(StepContext);
	const active = useContext(SlideActiveContext);
	const array = Children.toArray(children);
	const count = array.length;
	const id = useId();
	const idRef = useRef(id);

	useEffect(() => {
		if (active) {
			registerSteps(count);
			return () => unregisterSteps(idRef.current);
		}
	}, [active, count, registerSteps, unregisterSteps]);

	return (
		<>
			{array.map((child, i) => (
				<div key={i} className={cn(i > currentStep && "hidden")}>
					{child}
				</div>
			))}
		</>
	);
}
