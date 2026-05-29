"use client";

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { type MDXComponents } from "mdx/types";
import { useCallback, Suspense, use, useState } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { SlideDeck, type Slide } from "@/lib/domains/slides";
import {
	SlideSessionOverlay,
	type SlideSessionRole,
	useSlideSession,
} from "@/lib/domains/slides/live-session";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

interface SlideSearch {
	live?: string;
	master?: boolean;
	presenter?: boolean;
	slide?: number;
	step?: number;
}

export const Route = createFileRoute("/slides/json-schema-form/")({
	validateSearch: (search: Record<string, unknown>): SlideSearch => {
		const parseNonNegativeInt = (raw: unknown): number | undefined => {
			if (raw === undefined || raw === null || raw === "") return undefined;
			const n = Number(raw);
			return Number.isFinite(n) && Number.isInteger(n) && n >= 0 ? n : undefined;
		};
		const parseSessionId = (raw: unknown): string | undefined => {
			if (typeof raw !== "string") return undefined;
			return /^[a-zA-Z0-9_-]{1,80}$/.test(raw) ? raw : undefined;
		};
		const parseBooleanParam = (raw: unknown): boolean | undefined => {
			if (raw === "1" || raw === "true" || raw === 1 || raw === true) return true;
			if (raw === "0" || raw === "false" || raw === 0 || raw === false) return false;
			return undefined;
		};
		return {
			live: parseSessionId(search.live),
			master: parseBooleanParam(search.master),
			presenter: parseBooleanParam(search.presenter),
			slide: parseNonNegativeInt(search.slide),
			step: parseNonNegativeInt(search.step),
		};
	},
	component: MainLayout,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/slides/json-schema-form") }],
		meta: [
			{ title: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}` },
			{
				name: "description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{
				property: "og:title",
				content: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}`,
			},
			{
				property: "og:description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:url",
				content: canonicalUrl("/slides/json-schema-form"),
			},
			{ property: "og:image", content: defaultOgImageUrl() },
			{
				name: "twitter:title",
				content: `Match made on the server: JSON Schema Forms ${SITE_TITLE_APPEND}`,
			},
			{
				name: "twitter:description",
				content: "How to add a moving RGB effect to your text using styled-components",
			},
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

const slidesPromise = import("./slides.re.mdx");

function SlideDeckLoader({
	slides,
	components,
	presenterMode,
	initialSlide,
	initialStep,
	controlledSlide,
	controlledStep,
	disableUserNavigation,
	onNavigate,
}: {
	slides: Slide[];
	components: MDXComponents;
	presenterMode: boolean;
	initialSlide?: number;
	initialStep?: number;
	controlledSlide?: number;
	controlledStep?: number;
	disableUserNavigation?: boolean;
	onNavigate: (slide: number, step: number) => void;
}) {
	return (
		<SlideDeck
			slides={slides}
			components={components}
			presenterMode={presenterMode}
			initialSlide={initialSlide}
			initialStep={initialStep}
			controlledSlide={controlledSlide}
			controlledStep={controlledStep}
			disableUserNavigation={disableUserNavigation}
			onNavigate={onNavigate}
			transitions={false}
			hide_slide_index
		/>
	);
}

function MainLayout() {
	const search = useSearch({ from: "/slides/json-schema-form/" });
	const navigate = useNavigate({ from: "/slides/json-schema-form/" });
	const presenterMode = search.presenter === true;
	const liveSessionId = search.live;
	const role: SlideSessionRole = search.master === true ? "master" : "viewer";
	const [localPosition, setLocalPosition] = useState(() => ({
		slide: search.slide ?? 0,
		step: search.step ?? 0,
	}));

	const handleRemoteNavigate = useCallback(
		(slide: number, step: number) => {
			void navigate({
				search: (prev) => ({ ...prev, slide, step }),
				replace: true,
			});
		},
		[navigate],
	);

	const liveSession = useSlideSession({
		sessionId: liveSessionId,
		role,
		localSlide: localPosition.slide,
		localStep: localPosition.step,
		onRemoteNavigate: handleRemoteNavigate,
	});

	const handleNavigate = useCallback(
		(slide: number, step: number) => {
			setLocalPosition({ slide, step });
			void navigate({
				search: (prev) => ({ ...prev, slide, step }),
				replace: true,
			});
		},
		[navigate],
	);

	return (
		<div className="fixed inset-0">
			<Suspense
				fallback={
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500">Loading slides...</p>
					</div>
				}
			>
				<SlideDeckLoader
					slides={use(slidesPromise).default}
					components={use(slidesPromise)._components}
					presenterMode={presenterMode}
					initialSlide={search.slide}
					initialStep={search.step}
					controlledSlide={role === "viewer" ? liveSession.snapshot?.position.slide : undefined}
					controlledStep={role === "viewer" ? liveSession.snapshot?.position.step : undefined}
					disableUserNavigation={Boolean(liveSessionId && role === "viewer")}
					onNavigate={handleNavigate}
				/>
			</Suspense>
			{liveSessionId ? (
				<SlideSessionOverlay
					sessionId={liveSessionId}
					role={role}
					connected={liveSession.connected}
					snapshot={liveSession.snapshot}
					createPoll={liveSession.createPoll}
					vote={liveSession.vote}
					closePoll={liveSession.closePoll}
					resetPoll={liveSession.resetPoll}
				/>
			) : null}
		</div>
	);
}
