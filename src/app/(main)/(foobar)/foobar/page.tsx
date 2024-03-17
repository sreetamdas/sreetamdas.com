import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard.client";

export const runtime = "edge";

export default function FoobarArchivePage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<ViewsCounter slug="/foobar" />
		</>
	);
}
