/**
 * Runtime step system — replaces build-time -- delimiter splitting.
 *
 * The <Steps> component progressively reveals children within a single slide.
 * It registers its child count with the deck through StepContext so the deck
 * knows when to advance slides vs. reveal another step.
 *
 * SlideActiveContext prevents Steps on inactive (off-screen) slides from
 * registering, since all slides render at once for transition animations.
 *
 * When a child is a <ul> or <ol>, its <li> children are flattened and
 * revealed one-by-one while preserving the list structure.
 */
import {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	useContext,
	useEffect,
	useId,
	useRef,
	type ReactElement,
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

function useStepItems(children: ReactNode) {
	const array = Children.toArray(children);
	const items: ReactNode[] = [];

	for (const child of array) {
		if (isValidElement(child) && (child.type === "ul" || child.type === "ol")) {
			const el = child as ReactElement<{ children?: ReactNode }>;
			const listItems = Children.toArray(el.props.children).filter(isValidElement);
			items.push(...listItems);
		} else {
			items.push(child);
		}
	}

	return items;
}

/**
 * Steps progressively reveals children one at a time.
 *
 * Each arrow press reveals the next child. When all children are visible and
 * there are no other Steps blocks with unrevealed children, the next press
 * advances to the next slide. Multiple <Steps> blocks on the same slide
 * accumulate sequentially — the second block's children follow the first's.
 *
 * Markdown lists are flattened: each <li> becomes a separate step while
 * preserving the list structure.
 */
export function Steps({ children }: { children: ReactNode }) {
	const { currentStep, registerSteps, unregisterSteps } = useContext(StepContext);
	const active = useContext(SlideActiveContext);
	const items = useStepItems(children);
	const count = items.length;
	const id = useId();
	const idRef = useRef(id);

	useEffect(() => {
		if (active) {
			registerSteps(count);
			return () => unregisterSteps(idRef.current);
		}
	}, [active, count, registerSteps, unregisterSteps]);

	const needsList = count > 0 && items.every((item) => isValidElement(item) && item.type === "li");

	const renderedItems = items.map((child, i) => {
		if (isValidElement(child) && needsList) {
			const li = child as ReactElement<{ className?: string }>;
			return cloneElement(li, {
				key: i,
				className: cn(li.props.className, i > currentStep && "hidden"),
			});
		}
		return (
			<div key={i} className={cn(i > currentStep && "hidden")}>
				{child}
			</div>
		);
	});

	if (needsList) return <ul className="mx-0 my-3 pl-0">{renderedItems}</ul>;

	return <>{renderedItems}</>;
}
