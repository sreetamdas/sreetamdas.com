import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiRss } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";
import { ColorSchemeToggle } from "@/lib/domains/colorScheme";

export const Header = () => (
	<header className="sticky top-0 z-10 h-[60px] bg-background">
		<a
			id="skip-link"
			href="#main-content"
			className="absolute left-8 top-8 h-px w-px -translate-y-full overflow-hidden rounded-global bg-primary p-2 text-background [clip:rect(1px_1px_1px_1px)] visited:no-underline hover:underline hover:decoration-current hover:decoration-solid hover:decoration-2 focus:block focus:h-auto focus:w-auto focus:translate-y-0 focus:[clip:auto] focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary dark:text-foreground"
		>
			Skip to main content
		</a>
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

export const Navbar = () => (
	<nav className="contents w-min">
		<ul className="contents">
			<li>
				<LinkTo href="/about" className="text-foreground hover:text-primary">
					about
				</LinkTo>
			</li>
			<li>
				<LinkTo href="/blog" className="text-foreground hover:text-primary">
					blog
				</LinkTo>
			</li>
			<li>
				<LinkTo href="/newsletter" className="text-foreground hover:text-primary">
					newsletter
				</LinkTo>
			</li>
			<li>
				<LinkTo href="/karma" className="text-foreground hover:text-primary">
					karma
				</LinkTo>
			</li>
			<li>
				<LinkTo href="/uses" className="text-foreground hover:text-primary">
					uses
				</LinkTo>
			</li>
		</ul>
		<ul className="contents">
			<li>
				<LinkTo
					href="https://github.com/sreetamdas"
					target="_blank"
					className="flex items-center text-2xl text-foreground hover:text-primary"
				>
					<FaGithub aria-label="Sreetam's GitHub" title="Sreetam Das' GitHub" />
				</LinkTo>
			</li>
			<li>
				<LinkTo
					href="https://twitter.com/_SreetamDas"
					target="_blank"
					className="flex items-center text-2xl text-foreground hover:text-primary"
				>
					<FaTwitter aria-label="Sreetam Das' Twitter" title="Sreetam Das' Twitter" />
				</LinkTo>
			</li>
			<li>
				<LinkTo
					href="https://sreetamdas.com/rss/feed.xml"
					className="flex items-center text-2xl text-foreground hover:text-primary"
				>
					<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
				</LinkTo>
			</li>
		</ul>
	</nav>
);
