import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiRss } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";

export const Navbar = () => {
	// eslint-disable-next-line no-console
	console.log("Navbar");

	return (
		<nav className="contents w-min">
			<ul className="contents">
				<li>
					<LinkTo href="/about" className="text-lg text-foreground hover:text-primary">
						about
					</LinkTo>
				</li>
				<li>
					<LinkTo href="/uses" className="text-lg text-foreground hover:text-primary">
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
};
