import { createFileRoute } from "@tanstack/react-router";

import { FOOBAR_KARMA_EARLY_SCRIPT } from "@/lib/domains/foobar/useFoobarKarma";

export const Route = createFileRoute("/(main)/(foobar)/foobar")({
	head: () => ({ scripts: [{ children: FOOBAR_KARMA_EARLY_SCRIPT }] }),
});
