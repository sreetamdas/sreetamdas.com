import { Navbar } from "./Navbar";

import { LinkTo } from "@/lib/components/Anchor";
import { ColorSchemeToggle } from "@/lib/domains/colorScheme";

export const Header = () => (
	<header className="h-[60px]">
		<LinkTo
			id="skip-link"
			href="#main-content"
			className="absolute top-8 left-8 h-px w-px -translate-y-full overflow-hidden rounded-global
			bg-primary p-2 text-background [clip:rect(1px_1px_1px_1px)] focus:block focus:h-auto 
			focus:w-auto focus:translate-y-0 focus:[clip:auto] dark:text-foreground"
		>
			Skip to main content
		</LinkTo>
		<div className="grid h-full grid-cols-[max-content_auto] content-center">
			<LinkTo href="/">
				<svg
					aria-label="Home"
					width={25}
					height={25}
					viewBox="0 0 25 25"
					xmlns="http://www.w3.org/2000/svg"
					className="fill-primary text-primary"
				>
					<title>Home</title>
					<rect width="25" height="25" rx="6" fill="currentColor" />
				</svg>
			</LinkTo>
			<div className="grid grid-flow-col place-items-center justify-center gap-x-4 justify-self-end">
				<Navbar />
				<ColorSchemeToggle />
			</div>
		</div>
	</header>
);
