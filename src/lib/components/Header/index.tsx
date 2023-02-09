import { Navbar } from "./Navbar";

import { LinkTo } from "@/lib/components/Anchor";

export const Header = () => (
	<header className="h-[60px]">
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
			</div>
		</div>
	</header>
);
