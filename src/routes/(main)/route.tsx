import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { NotFound404 } from "@/lib/components/Error";
import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel";

export const Route = createFileRoute("/(main)")({
	component: RouteComponent,
	notFoundComponent: () => <NotFound404 />,
});

function RouteComponent() {
	return (
		<>
			<Header />
			<main
				id="main-content"
				className="relative grid grid-flow-col grid-cols-[1fr_min(var(--max-width),calc(100%-2rem))_1fr] gap-x-4 *:[grid-column:2]"
			>
				<Outlet />
			</main>
			<Footer>
				<FoobarPixel />
			</Footer>
		</>
	);
}
