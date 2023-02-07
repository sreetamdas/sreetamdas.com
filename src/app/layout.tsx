import styles from "./styles.module.css";
import "./global.css";

import { Footer } from "@/lib/components/Footer";
import { interFont, iosevkaFont, madeMellowFont } from "@/lib/styles/typography";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`${interFont.variable} ${iosevkaFont.variable} ${madeMellowFont.variable}`}
		>
			<head />
			<body>
				<main className={`${styles["main-wrapper"]}`}>
					<nav>Navbar</nav>
					<div id="main-content">{children}</div>
					<Footer />
				</main>
			</body>
		</html>
	);
}
