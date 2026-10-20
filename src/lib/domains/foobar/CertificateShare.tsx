"use client";

/** Browser-only share controls for the otherwise server-rendered certificate. */
import { useState } from "react";

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
			className="rounded-global border border-foreground/30 px-4 py-2 text-sm font-medium hover:border-secondary hover:text-secondary"
			onClick={() => void handleShare()}
			type="button"
		>
			{status === "copied"
				? "Link copied"
				: status === "failed"
					? "Couldn't share. Copy the address bar link."
					: "Share certificate"}
		</button>
	);
}
