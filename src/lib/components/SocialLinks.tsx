import { type ReactElement } from "react";
import { IconBaseProps } from "react-icons";
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

type ExternalLinksArrayType = Array<{
	link: string;
	title: string;
	Icon: (props: IconBaseProps) => ReactElement;
	onClick?: () => void;
}>;
export const SocialLinks = () => {
	const external_links: ExternalLinksArrayType = [
		{
			link: "https://github.com/sreetamdas",
			title: "Sreetam Das' GitHub",
			Icon: (props) => <FaGithub {...props} />,
		},
		{
			link: "https://twitter.com/_SreetamDas",
			title: "Sreetam Das' Twitter",
			Icon: (props) => <FaTwitter {...props} />,
		},
		{
			link: "https://stackoverflow.com/users/5283213",
			title: "Sreetam Das' StackOverflow",
			Icon: (props) => <FaStackOverflow {...props} />,
		},
		{
			link: "https://peerlist.io/sreetamdas",
			title: "Sreetam Das' Peerlist",
			Icon: (props) => <SiPeerlist {...props} />,
		},
		{
			link: "https://www.linkedin.com/in/sreetamdas",
			title: "Sreetam Das' LinkedIn",
			Icon: (props) => <FaLinkedin {...props} />,
		},
		{
			link: "mailto:sreetam@sreetamdas.com",
			title: "Send email to Sreetam Das",
			Icon: (props) => <FaEnvelope {...props} />,
		},
		{
			link: "https://steamcommunity.com/id/karmanaut007",
			title: "Sreetam Das' Steam",
			Icon: (props) => <FaSteam {...props} />,
		},
		{
			link: "https://giphy.com/gifs/LrmU6jXIjwziE/tile",
			title: "Sreetam Das' Reddit",
			Icon: (props) => <FaRedditAlien {...props} />,
			onClick: () => {
				// TODO: add Plausible event to track this as a new foobar badge
				// eslint-disable-next-line no-console
				console.log("Rick-rolled");
			},
		},
		{
			link: "https://open.spotify.com/user/22nkuerb2tgjpqwhy4tp4aecq",
			title: "Sreetam Das' Spotify",
			Icon: (props) => <FaSpotify {...props} />,
		},
		{
			link: "https://srtm.fyi/ds",
			title: "Join Sreetam Das' Discord server",
			Icon: (props) => <FaDiscord {...props} />,
		},
	];

	return (
		<ul className="flex flex-wrap place-items-center justify-center gap-4 px-12 py-4 sm:p-4">
			{external_links.map(({ link, onClick, Icon, title }) => (
				<li key={title} className="text-2xl">
					<a className="link-base" href={link} onClick={onClick}>
						<Icon title={title} />
					</a>
				</li>
			))}
		</ul>
	);
};
