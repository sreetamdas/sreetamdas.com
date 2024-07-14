"use client";

import { type ReactElement, cloneElement } from "react";
import {
	FaDiscord,
	FaEnvelope,
	FaGithub,
	FaLinkedin,
	FaRedditAlien,
	FaSpotify,
	FaStackOverflow,
	FaSteam,
	FaTwitter,
} from "react-icons/fa";
import { SiPeerlist } from "react-icons/si";

import { LinkTo } from "@/lib/components/Anchor";

const IconWithProps = ({ icon, title }: { icon: ReactElement; title: string }) =>
	cloneElement(icon, { title });

type ExternalLinksArrayType = Array<{
	link: string;
	title: string;
	icon: ReactElement;
	onClick?: () => void;
}>;
export const SocialLinks = () => {
	const external_links: ExternalLinksArrayType = [
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
			link: "https://peerlist.io/sreetamdas",
			title: "Sreetam Das' Peerlist",
			icon: <SiPeerlist />,
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
			onClick: () => {
				// TODO: add Plausible event to track this as a new foobar badge
				// biome-ignore lint/suspicious/noConsoleLog: temp
				console.log("Rick-rolled");
			},
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

	return (
		<ul className="flex flex-wrap place-items-center justify-center gap-4 px-12 py-4 sm:p-4">
			{external_links.map(({ link, onClick, ...props }) => (
				<li key={props.title} className="text-2xl">
					<LinkTo href={link} onClick={onClick}>
						<IconWithProps {...props} />
					</LinkTo>
				</li>
			))}
		</ul>
	);
};
