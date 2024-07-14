"use client";

import { useEffect } from "react";

export default function MainRouteGroupError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.error(error);
	}, [error]);

	return (
		<div>
			<h2>Something went wrong!</h2>
			<button
				className="link-base text-2xl text-foreground hover:text-primary"
				onClick={() => reset()}
				type="button"
			>
				Reset and try again
			</button>
		</div>
	);
}
