import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiRss } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";

export const NavigationItems = () => (
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
		<ul className="mt-12 grid grid-flow-col gap-x-8 md:mt-0 md:contents">
			<li>
				<LinkTo
					href="https://github.com/sreetamdas"
					target="_blank"
					className="flex items-center text-3xl text-foreground hover:text-primary md:text-2xl"
				>
					<FaGithub aria-label="Sreetam's GitHub" title="Sreetam Das' GitHub" />
				</LinkTo>
			</li>
			<li>
				<LinkTo
					href="https://x.com/_SreetamDas"
					target="_blank"
					className="flex items-center text-3xl text-foreground hover:text-primary md:text-2xl"
				>
					<FaXTwitter aria-label="Sreetam Das' Twitter" title="Sreetam Das' Twitter" />
				</LinkTo>
			</li>
			<li>
				<LinkTo
					href="https://sreetamdas.com/rss/feed.xml"
					className="flex items-center text-3xl text-foreground hover:text-primary md:text-2xl"
				>
					<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
				</LinkTo>
			</li>
		</ul>
	</nav>
);
