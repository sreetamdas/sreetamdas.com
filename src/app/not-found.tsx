import type { ReactNode } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { NotFoundDogsLink, NotFoundFoobarTracker } from "@/lib/components/error";

export type GlobalNotFoundPageProps = {
	message?: ReactNode;
};
export default function GlobalNotFound({ message }: GlobalNotFoundPageProps) {
	return (
		<>
			<h1 className="pt-10 text-center font-serif text-[160px]">404!</h1>
			<p className="pt-4 text-center font-serif text-3xl">
				The page you&apos;re looking for does not exist.
			</p>

			{message ? message : null}

			<p className="pt-40 text-center">
				<LinkTo href="/">Go back home</LinkTo>
			</p>

			<NotFoundDogsLink />
			<NotFoundFoobarTracker />
		</>
	);
}
