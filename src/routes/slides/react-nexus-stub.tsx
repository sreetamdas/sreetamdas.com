import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/slides/react-nexus-stub")({
	component: RouteComponent,
	loader: () => {
		return {
			foo: "bar",
		};
	},
});

function RouteComponent() {
	const _props = Route.useLoaderData();

	return <div>Hello "/slides/react-nexus"!</div>;
}
