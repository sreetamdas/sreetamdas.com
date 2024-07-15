"use client";

import { cn } from "@/lib/helpers/utils";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
	type ComponentPropsWithoutRef,
	type ElementRef,
	type HTMLAttributes,
	forwardRef,
} from "react";
import { LuX } from "react-icons/lu";

const DrawerRoot = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerClose = DrawerPrimitive.Close;
const DrawerPortal = DrawerPrimitive.Portal;

const DrawerOverlay = forwardRef<
	ElementRef<typeof DrawerPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Overlay
		className={cn(
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
			className,
		)}
		{...props}
		ref={ref}
	/>
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

interface DrawerContentProps extends ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {}

const DrawerContent = forwardRef<ElementRef<typeof DrawerPrimitive.Content>, DrawerContentProps>(
	({ className, children, ...props }, ref) => (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				ref={ref}
				className={cn(
					"data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 h-full w-3/4 gap-4 border-r bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-duration-300 data-[state=closed]:animate-out data-[state=open]:animate-duration-500 data-[state=open]:animate-in sm:max-w-sm",
					className,
				)}
				{...props}
			>
				{children}
				<DrawerPrimitive.Close className="absolute top-4 right-4 rounded-sm text-2xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
					<LuX className="size-6" />
					<span className="sr-only">Close</span>
				</DrawerPrimitive.Close>
			</DrawerPrimitive.Content>
		</DrawerPortal>
	),
);
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

const DrawerTitle = forwardRef<
	ElementRef<typeof DrawerPrimitive.Title>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & { hidden?: boolean }
>(({ className, hidden = true, ...props }, ref) => (
	<VisuallyHidden.Root asChild>
		<DrawerPrimitive.Title
			ref={ref}
			className={cn("font-semibold text-foreground text-lg", className)}
			{...props}
		/>
	</VisuallyHidden.Root>
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = forwardRef<
	ElementRef<typeof DrawerPrimitive.Description>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
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
