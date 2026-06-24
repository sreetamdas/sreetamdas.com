"use client";

import * as DrawerPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { type ComponentProps, type HTMLAttributes } from "react";
import { LuX } from "react-icons/lu";

import { cn } from "@/lib/helpers/utils";

const DrawerRoot = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerClose = DrawerPrimitive.Close;
const DrawerPortal = DrawerPrimitive.Portal;

function DrawerOverlay({
	className,
	ref,
	...props
}: ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			className={cn(
				"fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
				className,
			)}
			{...props}
			ref={ref}
		/>
	);
}
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type DrawerContentProps = ComponentProps<typeof DrawerPrimitive.Content>;

function DrawerContent({ className, children, ref, ...props }: DrawerContentProps) {
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				ref={ref}
				className={cn(
					"fixed inset-y-0 left-0 z-50 h-full w-3/4 gap-4 border-r bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:animate-duration-(--transition-duration) data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:animate-duration-(--transition-duration) data-[state=open]:slide-in-from-left sm:max-w-sm",
					className,
				)}
				{...props}
			>
				{children}
				<DrawerPrimitive.Close className="absolute top-4 right-4 rounded-sm text-2xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-dashed disabled:pointer-events-none data-[state=open]:bg-secondary">
					<LuX className="size-6" />
					<span className="sr-only">Close</span>
				</DrawerPrimitive.Close>
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}
DrawerContent.displayName = DrawerPrimitive.Content.displayName;

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

function DrawerTitle({
	className,
	ref,
	...props
}: ComponentProps<typeof DrawerPrimitive.Title> & { hidden?: boolean }) {
	return (
		<VisuallyHidden.Root asChild>
			<DrawerPrimitive.Title
				ref={ref}
				className={cn("text-lg font-semibold text-foreground", className)}
				{...props}
			/>
		</VisuallyHidden.Root>
	);
}
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

function DrawerDescription({
	className,
	ref,
	...props
}: ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			ref={ref}
			className={cn("text-sm text-foreground/70", className)}
			{...props}
		/>
	);
}
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

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
