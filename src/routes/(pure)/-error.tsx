import { useEffect } from "react";
import { captureException } from "@/lib/domains/Sentry";

export default function PureRouteGroupError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		captureException(error);
	}, [error]);

	return (
		<div>
			<h2>Something went wrong!</h2>
			<p>
				You&apos;re in the <code>/foobar</code> route
			</p>
			<button
				className="link-base text-foreground hover:text-primary text-2xl"
				onClick={() => reset()}
				type="button"
			>
				Reset and try again
			</button>
		</div>
	);
}
