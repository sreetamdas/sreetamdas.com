import { merge } from "lodash-es";
import create from "zustand";

import { initialFoobarData } from "@/components/foobar";
import { TFoobarData } from "@/typings/console";

type FoobarStoreType = {
	foobarData: TFoobarData;
	setFoobarData: (data: Partial<TFoobarData>) => void;
};

export const useFoobarStore = create<FoobarStoreType>((set) => ({
	foobarData: initialFoobarData,
	setFoobarData: (data) => set((state) => ({ foobarData: merge(state.foobarData, data) })),
}));
