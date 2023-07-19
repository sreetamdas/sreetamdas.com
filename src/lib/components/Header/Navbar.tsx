import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiRss } from "react-icons/fi";

import { LinkTo } from "@/lib/components/Anchor";

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
