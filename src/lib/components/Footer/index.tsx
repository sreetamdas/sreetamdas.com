import styles from "./styles.module.css";

export const Footer = () => (
	<footer className={styles.footer}>
		{/* <Foobar /> */}
		{/* <GitHubStats /> */}
		Made with <a href="https://nextjs.org">Next.js</a> &bull; View source on{" "}
		<a href="https://github.com/sreetamdas/sreetamdas.com">GitHub</a> <span>&bull;</span> <br />
		Find me on <a href="https://twitter.com/_SreetamDas">Twitter</a>
		<p className={styles.greeting}>I hope you have a very nice day :)</p>
	</footer>
);
