"use client";

/** Browser-only share controls for the otherwise server-rendered certificate. */
import { useState } from "react";

export function CertificateShare({ title, url }: { title: string; url: string }) {
	const [copied, setCopied] = useState(false);

	async function handleShare() {
		if (navigator.share) {
			await navigator.share({ title, url });
			return;
		}
		await navigator.clipboard.writeText(url);
		setCopied(true);
	}

	return (
		<button
			className="rounded-global border border-foreground/30 px-4 py-2 text-sm font-medium hover:border-secondary hover:text-secondary"
			onClick={() => void handleShare()}
			type="button"
		>
			{copied ? "Link copied" : "Share certificate"}
		</button>
	);
}
