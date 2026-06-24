import { createContext } from "react";

export interface StepContextValue {
	currentStep: number;
	registerSteps: (id: string, count: number) => void;
	unregisterSteps: (id: string) => void;
}

export const StepContext = createContext<StepContextValue>({
	currentStep: 0,
	registerSteps: () => {},
	unregisterSteps: () => {},
});

export const SlideActiveContext = createContext(false);
