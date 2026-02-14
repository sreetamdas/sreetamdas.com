import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiRss } from "react-icons/fi";

import { Link } from "@tanstack/react-router";

export const NavigationItems = () => (
	<nav className="contents w-min">
		<ul className="contents">
			<li>
				<Link to="/about" preload="intent" className="link-base text-foreground hover:text-primary">
					about
				</Link>
			</li>
			<li>
				<Link to="/blog" preload="intent" className="link-base text-foreground hover:text-primary">
					blog
				</Link>
			</li>
			<li>
				<Link to="/karma" preload="intent" className="link-base text-foreground hover:text-primary">
					karma
				</Link>
			</li>
			<li>
				<Link
					to="/$slug"
					params={{ slug: "uses" }}
					preload="intent"
					className="link-base text-foreground hover:text-primary"
				>
					uses
				</Link>
			</li>
		</ul>
		<ul className="mt-12 grid grid-flow-col gap-x-8 md:mt-0 md:contents">
			<li>
				<a
					href="https://github.com/sreetamdas"
					target="_blank"
					className="link-base text-foreground hover:text-primary flex items-center text-3xl md:text-2xl"
				>
					<FaGithub aria-label="Sreetam's GitHub" title="Sreetam Das' GitHub" />
				</a>
			</li>
			<li>
				<a
					href="https://twitter.com/_SreetamDas"
					target="_blank"
					className="link-base text-foreground hover:text-primary flex items-center text-3xl md:text-2xl"
				>
					<FaTwitter aria-label="Sreetam Das' Twitter" title="Sreetam Das' Twitter" />
				</a>
			</li>
			<li>
				<a
					href="https://sreetamdas.com/rss/feed.xml"
					className="link-base text-foreground hover:text-primary flex items-center text-3xl md:text-2xl"
				>
					<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
				</a>
			</li>
		</ul>
	</nav>
);
