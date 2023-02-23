import { ViewsCounter } from "@/lib/domains/Supabase";

export default function Home() {
	return (
		<>
			<h1 className="py-20 text-center font-serif text-7xl">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			{/* @ts-expect-error async Server Component */}
			<ViewsCounter slug="/" hidden />
		</>
	);
}
