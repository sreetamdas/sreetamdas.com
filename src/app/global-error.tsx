"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	// eslint-disable-next-line no-console
	console.error("Caught ==>", error);

	return (
		<html lang="en">
			<head></head>
			<body>
				<h2>Something went wrong!</h2>
				<button onClick={() => reset()}>Try again</button>
			</body>
		</html>
	);
}
