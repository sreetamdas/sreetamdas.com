"use client";

import { Dialog } from "@base-ui/react/dialog";
import { type ComponentProps, type HTMLAttributes } from "react";
import { LuX } from "react-icons/lu";

import { cn } from "@/lib/helpers/utils";

const DrawerRoot = Dialog.Root;
const DrawerTrigger = Dialog.Trigger;
const DrawerClose = Dialog.Close;
const DrawerPortal = Dialog.Portal;

function DrawerOverlay({ className, ref, ...props }: ComponentProps<typeof Dialog.Backdrop>) {
	return (
		<Dialog.Backdrop
			className={cn(
				"fixed inset-0 z-50 bg-black/80 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0",
				className,
			)}
			{...props}
			ref={ref}
		/>
	);
}

type DrawerContentProps = ComponentProps<typeof Dialog.Popup>;

function DrawerContent({ className, children, ref, ...props }: DrawerContentProps) {
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<Dialog.Popup
				ref={ref}
				className={cn(
					"fixed inset-y-0 left-0 z-50 h-full w-3/4 gap-4 border-r bg-background p-6 shadow-lg transition ease-in-out data-closed:animate-out data-closed:animate-duration-(--transition-duration) data-closed:slide-out-to-left data-open:animate-in data-open:animate-duration-(--transition-duration) data-open:slide-in-from-left sm:max-w-sm",
					className,
				)}
				{...props}
			>
				{children}
				<Dialog.Close className="absolute top-4 right-4 rounded-sm text-2xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-dashed disabled:pointer-events-none">
					<LuX className="size-6" />
					<span className="sr-only">Close</span>
				</Dialog.Close>
			</Dialog.Popup>
		</DrawerPortal>
	);
}

const DrawerHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
		{...props}
	/>
);
DrawerFooter.displayName = "DrawerFooter";

function DrawerTitle({ className, ref, ...props }: ComponentProps<typeof Dialog.Title>) {
	return (
		<Dialog.Title
			ref={ref}
			className={cn("sr-only text-lg font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	ref,
	...props
}: ComponentProps<typeof Dialog.Description>) {
	return (
		<Dialog.Description
			ref={ref}
			className={cn("text-sm text-foreground/70", className)}
			{...props}
		/>
	);
}

export {
	DrawerRoot,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
