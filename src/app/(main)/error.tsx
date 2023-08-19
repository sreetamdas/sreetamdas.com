"use client";

import { captureException } from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		captureException(error);
	}, [error]);

	return (
		<div>
			<h2>Something went wrong!</h2>
			<button
				className="link-base text-2xl text-foreground hover:text-primary"
				onClick={() => reset()}
			>
				Reset and try again
			</button>
		</div>
	);
}
