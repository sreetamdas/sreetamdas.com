import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useContext, cloneElement, MouseEvent, useRef } from "react";
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
import { FiRss, FiSun, FiMenu, FiX } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import { ThemeContext } from "styled-components";

import {
	PlatformLinksContainer,
	NavLink,
	LogoSVG,
	ThemeSwitch,
	MobileMenuToggle,
	Header,
	HeaderInner,
	Nav,
	PageLinks,
	IconLinks,
	NavLinksDesktop,
	FullScreenWrapper,
	NavContainer,
} from "./styles";

import { Button } from "@/components/Button";
import { useFoobarStore } from "@/domains/Foobar";
import { canvasDrawRectangle } from "@/domains/style/darkmode";
import { theme as siteTHeme } from "@/styles";
import { LinkedIcon } from "@/styles/blog";
import { useHasMounted } from "@/utils/hooks";

export const Navbar = () => {
	const hasMounted = useHasMounted();

	if (!hasMounted) return <Header />;

	return (
		<Header>
			<HeaderInner>
				<Link href="/" passHref>
					<LinkedIcon>
						<LogoSVG aria-label="Home">
							<title>Home</title>
							<rect width="25" height="25" rx="6" fill="currentColor" />
						</LogoSVG>
					</LinkedIcon>
				</Link>
				<NavbarMenu />
			</HeaderInner>
		</Header>
	);
};

const NavbarMenu = () => {
	const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
	const [showDrawer, setShowDrawer] = useState(false);
	const { isLoading, session } = useSessionContext();
	const supabaseClient = useSupabaseClient();

	const konami = useFoobarStore((state) => state.foobarData.konami);
	const { asPath } = useRouter();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { themeType, changeThemeVariant } = useContext(ThemeContext);

	const canvas = canvasRef.current;
	const canvasContext = canvas?.getContext("2d");

	function updateFavicon(
		ctx: CanvasRenderingContext2D | null | undefined,
		colorMode: typeof themeType
	) {
		if (canvas !== null && typeof ctx !== "undefined" && ctx !== null) {
			const color = siteTHeme[colorMode].accentPrimary;
			ctx.fillStyle = color;
			ctx.strokeStyle = color;

			canvasDrawRectangle(ctx, 0, 0, 100, 100, 25, true, true);
			const data = canvas.toDataURL("image/png");

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']")!;
			link.type = "image/x-icon";
			link.href = data;
		}
	}

	const isAdminRoute = asPath.includes("/admin");

	async function handleSignOut() {
		await supabaseClient.auth.signOut();
	}

	function handleThemeToggle() {
		setDarkTheme((isDarkTheme) => {
			updateFavicon(canvasContext, isDarkTheme ? "light" : "dark");
			return !isDarkTheme;
		});
	}

	function handleKeyboardDarkModeToggle(event: KeyboardEvent) {
		if (
			event.metaKey &&
			event.ctrlKey &&
			event.altKey &&
			event.shiftKey &&
			(event.key?.toLowerCase() === "l" || event.code === "KeyL")
		) {
			handleThemeToggle();
		}
	}

	function handleThemeToggleClick(event: MouseEvent) {
		event.preventDefault();
		handleThemeToggle();
	}

	function handleToggleDrawer() {
		setShowDrawer((showDrawer) => {
			const nextState = !showDrawer;

			if (nextState === true) {
				document.body.style.overflow = "hidden";
			} else {
				// Re-enable scrolling once menu is closed
				document.body.style.removeProperty("overflow");
			}

			return nextState;
		});
	}

	useEffect(() => {
		// Get initial dark mode
		const root = window.document.documentElement;
		const initialColorValue = root.style.getPropertyValue("--initial-color-mode") as
			| "light"
			| "dark";
		setDarkTheme(initialColorValue === "dark");

		// Keyboard dark mode toggle
		window.addEventListener("keydown", handleKeyboardDarkModeToggle);

		return () => {
			window.removeEventListener("keydown", handleKeyboardDarkModeToggle);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (darkTheme !== undefined) {
			updateFavicon(canvasContext, darkTheme ? "dark" : "light");
			changeThemeVariant(darkTheme ? "dark" : "light");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [darkTheme]);

	useEffect(() => {
		if (darkTheme !== undefined) {
			if (darkTheme) {
				document.documentElement.setAttribute("data-theme", konami ? "batman" : "dark");
				window.localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.removeAttribute("data-theme");
				window.localStorage.setItem("theme", "light");
			}
		}
	}, [darkTheme, konami]);

	useEffect(() => {
		if (typeof themeType !== "undefined") setDarkTheme(themeType === "dark");
	}, [themeType]);

	useEffect(() => {
		setShowDrawer(false);
		document.body.style.removeProperty("overflow");
	}, [asPath]);

	return (
		<>
			<Head>
				<meta name="theme-color" content={darkTheme ? "#9D86E9" : "#5B34DA"} />
			</Head>
			<canvas ref={canvasRef} width="100" height="100" hidden></canvas>
			<AnimatePresence>
				<NavContainer $showDrawer={showDrawer} key="navigation">
					<NavLinksDesktop>
						<NavLinks />
					</NavLinksDesktop>
					<ThemeSwitch onClick={handleThemeToggleClick}>
						{darkTheme === undefined ? (
							<span style={{ width: "25px" }} />
						) : darkTheme ? (
							<IoMdMoon aria-label="Switch to Light Mode" title="Switch to Light Mode" />
						) : (
							<FiSun aria-label="Switch to Dark Mode" title="Switch to Dark Mode" />
						)}
					</ThemeSwitch>
					{isLoading && "isLoading"}
					{session && isAdminRoute && (
						<Button onClick={handleSignOut} $size="small">
							Sign out
						</Button>
					)}
					<MobileMenuToggle
						onClick={handleToggleDrawer}
						aria-label={showDrawer ? "Close menu" : "Open menu"}
					>
						{showDrawer ? (
							<FiX aria-label="Open menu" title="Open menu" />
						) : (
							<FiMenu aria-label="Open menu" title="Open menu" />
						)}
					</MobileMenuToggle>
				</NavContainer>
				<FullScreenWrapper
					key="mobile-navigation"
					aria-label="mobile-navigation"
					$visible={showDrawer}
					variants={variants}
					initial="closed"
					animate={showDrawer ? "open" : "closed"}
					transition={{ type: "spring", stiffness: 180, damping: 20 }}
				>
					<NavLinks />
				</FullScreenWrapper>
			</AnimatePresence>
		</>
	);
};

const variants: Variants = {
	open: { opacity: 1, transition: { staggerChildren: 0.1 } },
	closed: { opacity: 0 },
};

const textLinksVariants: Variants = {
	open: { x: 0, opacity: 1 },
	closed: { x: "-100%", opacity: 0 },
};

const iconLinksVariants: Variants = {
	open: { opacity: 1 },
	closed: { opacity: 0 },
};

const NavLinks = () => (
	<Nav>
		<PageLinks>
			<motion.li variants={textLinksVariants}>
				<NavLink href="/about">about</NavLink>
			</motion.li>
			<motion.li variants={textLinksVariants}>
				<NavLink href="/blog">blog</NavLink>
			</motion.li>
			<motion.li variants={textLinksVariants}>
				<NavLink href="/newsletter">newsletter</NavLink>
			</motion.li>
			<motion.li variants={textLinksVariants}>
				<NavLink href="/karma">karma</NavLink>
			</motion.li>
			<motion.li variants={textLinksVariants}>
				<NavLink href="/uses">uses</NavLink>
			</motion.li>
		</PageLinks>
		<IconLinks>
			<motion.li variants={iconLinksVariants}>
				<LinkedIcon href="https://github.com/sreetamdas" target="_blank" $styledOnHover>
					<FaGithub aria-label="Sreetam's GitHub" title="Sreetam Das' GitHub" />
				</LinkedIcon>
			</motion.li>
			<motion.li variants={iconLinksVariants}>
				<LinkedIcon href="https://twitter.com/_SreetamDas" target="_blank" $styledOnHover>
					<FaTwitter aria-label="Sreetam Das' Twitter" title="Sreetam Das' Twitter" />
				</LinkedIcon>
			</motion.li>
			<motion.li variants={iconLinksVariants}>
				<LinkedIcon href="https://sreetamdas.com/rss/feed.xml" $styledOnHover>
					<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
				</LinkedIcon>
			</motion.li>
		</IconLinks>
	</Nav>
);

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
		<PlatformLinksContainer>
			{externalLinks.map(({ link, title, icon }) => (
				<LinkedIcon href={link} title={title} key={title} target="_blank">
					<IconWithProps {...{ icon, title }} />
				</LinkedIcon>
			))}
		</PlatformLinksContainer>
	);
};
