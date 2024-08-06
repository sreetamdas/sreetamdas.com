"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LuMenu } from "react-icons/lu";

import { DrawerContent, DrawerRoot, DrawerTitle, DrawerTrigger } from "@/lib/components/Drawer";

import { NavigationItems } from "./NavItems";

export const NavbarMobile = () => {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

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
