import { cloneElement } from "react";
import {
	FaGithub,
	FaTwitter,
	FaStackOverflow,
	FaLinkedin,
	FaEnvelope,
	FaSteam,
	FaRedditAlien,
	FaSpotify,
	FaDiscord,
} from "react-icons/fa";

import { LinkTo } from "@/lib/components/Anchor";

type ExternalLinksArrayType = Array<{
	link: string;
	title: string;
	icon: JSX.Element;
}>;
export const ExternalLinksOverlay = () => {
	const externalLinks: ExternalLinksArrayType = [
		{
			link: "https://github.com/sreetamdas",
			title: "Sreetam Das' GitHub",
			icon: <FaGithub />,
		},
		{
			link: "https://twitter.com/_SreetamDas",
			title: "Sreetam Das' Twitter",
			icon: <FaTwitter />,
		},
		{
			link: "https://stackoverflow.com/users/5283213",
			title: "Sreetam Das' StackOverflow",
			icon: <FaStackOverflow />,
		},
		{
			link: "https://www.linkedin.com/in/sreetamdas",
			title: "Sreetam Das' LinkedIn",
			icon: <FaLinkedin />,
		},
		{
			link: "mailto:sreetam@sreetamdas.com",
			title: "Send email to Sreetam Das",
			icon: <FaEnvelope />,
		},
		{
			link: "https://steamcommunity.com/id/karmanaut007",
			title: "Sreetam Das' Steam",
			icon: <FaSteam />,
		},
		{
			link: "https://giphy.com/gifs/LrmU6jXIjwziE/tile",
			title: "Sreetam Das' Reddit",
			icon: <FaRedditAlien />,
			// TODO: add Plausible event to track this as a new foobar badge
		},
		{
			link: "https://open.spotify.com/user/22nkuerb2tgjpqwhy4tp4aecq",
			title: "Sreetam Das' Spotify",
			icon: <FaSpotify />,
		},
		{
			link: "https://srtm.fyi/ds",
			title: "Join Sreetam Das' Discord server",
			icon: <FaDiscord />,
		},
	];

	const IconWithProps = ({ icon, title }: { icon: JSX.Element; title: string }) =>
		cloneElement(icon, { title });

	return (
		<ul className="flex flex-wrap place-items-center justify-center gap-4 px-12 py-4 sm:p-4">
			{externalLinks.map(({ link, ...props }) => (
				<li key={props.title} className="text-2xl">
					<LinkTo href={link}>
						<IconWithProps {...props} />
					</LinkTo>
				</li>
			))}
		</ul>
	);
};
