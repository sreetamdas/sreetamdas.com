import styles from "./styles.module.css";
import "./global.css";

import { Footer } from "@/lib/components/Footer";
import StyledComponentsRegistry from "@/lib/registry/style";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			{/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
			<head />
			<body>
				<StyledComponentsRegistry>
					<main className={styles["page-wrapper"]}>
						<nav>Navbar</nav>
						<div className={styles["content-layout"]}>{children}</div>
						<Footer />
					</main>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
