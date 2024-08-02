import { PropsWithChildren, useCallback, type ReactNode } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { NotFoundDogsLink } from "@/lib/components/Error";
import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel.client";
import { Gradient } from "@/lib/components/Typography";

export type GlobalNotFoundPageProps = {
	message?: ReactNode;
	hasLayout?: boolean;
};
export default function GlobalNotFound({ message, hasLayout = false }: GlobalNotFoundPageProps) {
	const Wrapper = useCallback(
		({ children }: PropsWithChildren) => {
			return hasLayout ? (
				<>{children}</>
			) : (
				<>
					<Header />
					<main
						id="main-content"
						className="relative grid grid-flow-col grid-cols-[1fr_min(var(--max-width),_calc(100%_-_2rem))_1fr] gap-x-4 children:[grid-column:2]"
					>
						{children}
					</main>
					<Footer>
						<FoobarPixel path="/404" />
					</Footer>
				</>
			);
		},
		[hasLayout],
	);

	return (
		<>
			<Wrapper>
				<h1 className="pt-10 text-center font-serif text-[160px] font-bold tracking-tighter">
					<Gradient>404!</Gradient>
				</h1>
				<p className="pt-4 text-center font-serif text-3xl font-bold tracking-tighter">
					The page you&apos;re looking for does not exist.
				</p>

				{message ? message : null}

				<p className="pt-40 text-center">
					<LinkTo href="/">Go back home</LinkTo>
				</p>

				<NotFoundDogsLink />
			</Wrapper>
		</>
	);
}
