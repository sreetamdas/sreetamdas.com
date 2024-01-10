import { SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

export const metadata = {
	title: `Resume ${SITE_TITLE_APPEND}`,
};

export default function ResumePage() {
	return (
		<div className="min-h-full">
			<div className="mx-auto my-5 w-fit rounded-global border-2 border-primary px-5 py-5 font-mono text-sm">
				<div className="max-w-3xl ">
					<section className="grid grid-cols-[minmax(450px,_500px)_minmax(200px,_1fr)] gap-5 pb-5">
						<header>
							<h1 className="text-5xl font-bold leading-normal tracking-tight">Sreetam Das</h1>
							<p className="leading-tight">
								Open source aficionado who loves minimalist interfaces and component based,
								deterministic development.
							</p>
						</header>
						<div className="flex flex-col items-end justify-end">
							<span>
								<a className="link-base">sreetam@sreetamdas.com</a>
							</span>
							<div className="flex flex-nowrap items-center gap-1">
								<a className="link-base">Web</a>
								<span className="text-xs text-primary/50">|</span>
								<a className="link-base">GitHub</a>
								<span className="text-xs text-primary/50">|</span>
								<a className="link-base">Twitter</a>
								<span className="text-xs text-primary/50">|</span>
								<a className="link-base">LinkedIn</a>
							</div>
						</div>
					</section>
					<section className="grid grid-cols-[minmax(450px,_500px)_minmax(200px,_1fr)] gap-5 border-t-2 border-primary/20 pt-5">
						<div id="main">
							<div id="experience">
								<h2 className="mb-4 font-bold uppercase text-secondary">Experience</h2>

								<p className="mb-2 mt-4">
									<a className="link-base font-bold">Remote</a>, remote —{" "}
									<span className="italic">
										Senior Frontend Engineer II,{" "}
										<span className="uppercase">Dec 2023 - present</span>
									</span>
								</p>

								<ul className="list-outside list-disc pl-4">
									<li>
										Lead development of major team-scoped projects, participate in cross-team and
										company-wide initiatives
									</li>
								</ul>

								<p className="mb-2 mt-4">
									<span className="italic">
										Senior Frontend Engineer I,{" "}
										<span className="uppercase">Dec 2021 - Dec 2023</span>
									</span>
								</p>

								<ul className="list-outside list-disc pl-4">
									<li>Implementing, maintaining and improving our software platforms</li>
									<li>
										Monitoring performance and other metrics with tools like Sentry, ContentKing,
										Ahrefs, VWO, DataDog, etc. and working with Google Tag Manager, Prismic,
										HubSpot, Mailgun and Litmus
									</li>
									<li>Ownership of multiple domain assets from conception to delivery</li>
									<li>Handling timely requests from various stakeholders</li>
								</ul>

								<p className="mb-2 mt-4">
									<span className="italic">
										<span className="">Frontend Engineer</span>,{" "}
										<span className="uppercase">Nov 2020 - Dec 2021</span>
									</span>
								</p>

								<ul className="list-outside list-disc pl-4">
									<li>Building with performance, accessibility and API design in mind</li>
									<li>Developed integrations with third party services including GraphQL</li>
									<li>Contributed to the shared component library</li>
									<li>Own and maintain multiple domains within the team’s responsibility</li>
									<li>Migrated an Elixir/Phoenix app to a modern React/Next.js stack</li>
								</ul>

								<p className="mb-2 mt-6">
									<a className="link-base font-bold">Microland</a>, Bengaluru —{" "}
									<span className="italic">
										Associate Tech Architect, <span className="uppercase">Jul 2018 - Oct 2020</span>
									</span>
								</p>

								<ul className="list-outside list-disc pl-4">
									<li>
										Module Lead for UI development: Rewrote codebase with React, Redux and
										TypeScript, as well as Websockets, Styled components and Jest
									</li>
									<li>
										Handled product pipeline across Google Cloud Platform using Python and Google
										PubSub
									</li>
								</ul>

								<p className="mb-2 mt-4">
									<span className="italic">
										<span className="">Intern</span>,{" "}
										<span className="uppercase">May 2017 - Jul 2017</span>
									</span>
								</p>

								<ul className="list-outside list-disc pl-4">
									<li>Worked with Python and APIs</li>
									<li>Web scraping and automation using PhantomJS</li>
								</ul>
							</div>

							<div id="projects">
								<h2 className="mt-6 font-bold uppercase text-secondary">Projects</h2>

								<ul className="mt-4 list-outside list-disc pl-4">
									<li>
										<a className="link-base">sreetamdas.com</a>: personal website built with
										Next.js, TypeScript and friends; open-sourced
									</li>
									<li>
										<a className="link-base">Newsletter</a>: weekly issues with content from the
										JavaScript and web development world, and mechanical keyboards
									</li>
									<li>
										<a className="link-base">Greenscreen</a>: using HTML Canvas API, also presented
										at a conference
									</li>
									<li>
										<a className="link-base">Karma</a>: a colourful VS Code theme with 18000+
										installs
									</li>
									<li>
										<a className="link-base">2048</a>: in C++ in a day
									</li>
								</ul>
							</div>
						</div>

						<div id="extra">
							<h2 className="mb-4 font-bold uppercase text-secondary">Skills</h2>
							<p className="mb-2 mt-4">
								React, CSS, Next.js, Redux, NodeJS, TypeScript, Python and Styled components
							</p>
							<h2 className="mt-6 font-bold uppercase text-secondary">Interests</h2>
							<p className="mb-2 mt-4">
								Developer Experience, Local-first Offline Apps, Performance
								<br />
								Mechanical keyboards, Quizzing & CS
							</p>
							<h2 className="mt-6 font-bold uppercase text-secondary">Achievements</h2>

							<h3 className="mt-4 font-bold">
								<a href="https://adventofcode.com" className="link-base">
									Advent of Code
								</a>
							</h3>
							<p>Solved with Elixir and TypeScript</p>

							<h3 className="mt-4 font-bold">React Day, India</h3>
							<p>
								<a href="https://youtu.be/vBO9jwotDgs" className="link-base">
									Building a Green Screen with React and HTML Elements
								</a>
							</p>

							<h3 className="mt-4 font-bold">
								<a href="https://foobar.withgoogle.com" className="link-base">
									Google Foobar
								</a>
							</h3>
							<p>Invited twice, cleared level 4</p>

							<h3 className="mt-4 font-bold">Quiz Club</h3>
							<p>General Secretary, authored and proctored dozens of quizzes</p>

							<h3 className="mt-4 font-bold">Model United Nations</h3>
							<p>Technical coordinator, NITMUN ’16</p>

							<h3 className="mt-4 font-bold">Talks at College Workshop</h3>
							<p>HTML, CSS, Git and GitHub</p>

							<h3 className="mt-4 font-bold">
								<a href="https://www.hackerrank.com/profile/sreetamdas" className="link-base">
									HackerRank
								</a>
							</h3>
							<p>Bronze and Silver in Week of Code</p>
							<h2 className="mt-6 font-bold uppercase text-secondary">Languages</h2>
							<p className="mb-2 mt-4">Fluent in English, Hindi and Odia</p>
						</div>
					</section>
				</div>
			</div>

			<ViewsCounter slug="/resume" />
		</div>
	);
}
