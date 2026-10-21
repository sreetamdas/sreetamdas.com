"use client";

/** Browser-only share controls for the otherwise server-rendered certificate. */
import { useState } from "react";

import { Bracketed } from "./Bracketed";

export function CertificateShare({ title, url }: { title: string; url: string }) {
	const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

	async function handleShare() {
		try {
			if (navigator.share) {
				await navigator.share({ title, url });
				return;
			}
			await navigator.clipboard.writeText(url);
			setStatus("copied");
		} catch (error) {
			// Closing the share sheet rejects with AbortError; that is not a failure.
			if (error instanceof DOMException && error.name === "AbortError") return;
			setStatus("failed");
		}
	}

	return (
		<button
			className="inline-flex min-h-11 items-center text-karma-yellow hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
			onClick={() => void handleShare()}
			type="button"
		>
			<Bracketed>
				{status === "copied"
					? "Link copied"
					: status === "failed"
						? "Couldn't share. Copy the address bar link."
						: "Share certificate"}
			</Bracketed>
		</button>
	);
}
