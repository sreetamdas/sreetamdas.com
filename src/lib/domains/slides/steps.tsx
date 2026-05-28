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
 * When a child wraps native <li> elements (e.g. a markdown list rendered
 * through the slide's custom ul component), the li content is extracted and
 * re-rendered through UnorderedList so that arrow markers and list styling
 * are preserved.
 */
import {
	Children,
	createContext,
	isValidElement,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	type ReactElement,
	type ReactNode,
} from "react";

import { UnorderedList } from "@/lib/components/Typography";
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

type LiElement = ReactElement<{ className?: string; children?: ReactNode }>;

function isNativeLi(node: ReactNode): node is LiElement {
	return isValidElement(node) && typeof node.type === "string" && node.type === "li";
}

function hasNativeLiGrandchild(child: ReactNode): child is ReactElement<{ children?: ReactNode }> {
	if (!isValidElement<{ children?: ReactNode }>(child)) return false;
	return Children.toArray(child.props.children).some(isNativeLi);
}

function extractLiContent(children: ReactNode): ReactNode[] {
	const items: ReactNode[] = [];
	for (const child of Children.toArray(children)) {
		if (isNativeLi(child)) {
			items.push(child.props.children);
		} else if (hasNativeLiGrandchild(child)) {
			for (const gc of Children.toArray(child.props.children)) {
				if (isNativeLi(gc)) items.push(gc.props.children);
			}
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
 * Markdown lists are rendered with arrow markers and list styling
 * matching the slide's UnorderedList component.
 */
export function Steps({ children }: { children: ReactNode }) {
	const { currentStep, registerSteps, unregisterSteps } = useContext(StepContext);
	const active = useContext(SlideActiveContext);

	const id = useId();
	const idRef = useRef(id);

	const liContent = useMemo(() => extractLiContent(children), [children]);
	const count = liContent.length;

	useEffect(() => {
		if (active) {
			registerSteps(count);
			return () => unregisterSteps(idRef.current);
		}
	}, [active, count, registerSteps, unregisterSteps]);

	if (liContent.length > 0) {
		return (
			<UnorderedList listClasses="mb-4 only:mt-4" markClasses="mt-1.5 text-2xl">
				{liContent.map((content, i) => (
					<div key={i} className={cn(i > currentStep && "hidden")}>
						{content}
					</div>
				))}
			</UnorderedList>
		);
	}

	// Non-list children: wrap each in a div, reveal one at a time
	const array = Children.toArray(children);

	useEffect(() => {
		if (active && count === 0) {
			registerSteps(array.length);
			return () => unregisterSteps(idRef.current);
		}
	}, [active, array.length, count, registerSteps, unregisterSteps]);

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
