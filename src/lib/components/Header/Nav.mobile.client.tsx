import { LuMenu } from "react-icons/lu";

import { DrawerContent, DrawerRoot, DrawerTitle, DrawerTrigger } from "@/lib/components/Drawer";

import { NavigationItems } from "./NavItems";
import { create } from "zustand";
import { routerInstance } from "@/router";
import { useEffect } from "react";

type MobileNavDrawerState = {
	open: boolean;
	setOpen: (open: boolean) => void;
};
export const useMobileNavDrawer = create<MobileNavDrawerState>((set) => ({
	open: false,
	setOpen: (open: boolean) => set({ open }),
}));

export const NavbarMobile = () => {
	const { open, setOpen } = useMobileNavDrawer();

	useEffect(() => {
		if (routerInstance !== null) {
			const unsubscribe = routerInstance.subscribe("onRendered", (_event) => {
				setOpen(false);
			});

			return () => {
				unsubscribe();
			};
		}
	}, [routerInstance]);

	return (
		<DrawerRoot open={open} onOpenChange={setOpen}>
			<div className="contents md:hidden">
				<DrawerTrigger asChild>
					<button className="text-2xl" type="button" aria-label="Close mobile navigation drawer">
						<LuMenu />
					</button>
				</DrawerTrigger>
			</div>
			<DrawerContent
				className="grid w-full items-center sm:max-w-full"
				aria-describedby={undefined}
			>
				<DrawerTitle>Mobile navigation drawer</DrawerTitle>
				<div className="my-8 grid w-min gap-y-6 pl-12 text-2xl">
					<NavigationItems />
				</div>
			</DrawerContent>
		</DrawerRoot>
	);
};
