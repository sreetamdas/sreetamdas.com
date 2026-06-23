"use client";

/**
 * Shared TanStack route shell for MDX-backed slide decks. Individual routes own
 * their metadata and deck-specific poll definitions; this component owns query
 * parsing, slide loading, and live-session coordination.
 */
import { type MDXComponents } from "mdx/types";
import { Suspense, use, useCallback, useEffect, useState } from "react";

import { SlideDeck, type Slide } from "@/lib/domains/slides";
import {
	SlideSessionOverlay,
	type SlideSessionPollDefinition,
	type SlideSessionRole,
} from "@/lib/domains/slides/live-session";
import { useSlideSession } from "@/lib/domains/slides/use-slide-session";

import { type SlideSearch } from "./route-search";

type SlideModule = {
	default: Array<Slide>;
	_components: MDXComponents;
};

type SlideDeckRouteShellProps = {
	search: SlideSearch;
	slidesPromise: Promise<SlideModule>;
	livePolls: Array<SlideSessionPollDefinition>;
	onPositionChange: (slide: number, step: number) => void;
};

export function SlideDeckRouteShell({
	search,
	slidesPromise,
	livePolls,
	onPositionChange,
}: SlideDeckRouteShellProps) {
	const presenterMode = search.presenter === true;
	const liveSessionId = search.live;
	const role: SlideSessionRole = search.master === true ? "master" : "viewer";
	const [localPosition, setLocalPosition] = useState(() => ({
		slide: search.slide ?? 0,
		step: search.step ?? 0,
	}));

	useEffect(() => {
		setLocalPosition({ slide: search.slide ?? 0, step: search.step ?? 0 });
	}, [search.slide, search.step]);

	const handleRemoteNavigate = useCallback(
		(slide: number, step: number) => {
			onPositionChange(slide, step);
		},
		[onPositionChange],
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
			onPositionChange(slide, step);
		},
		[onPositionChange],
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
					module={use(slidesPromise)}
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
					currentSlide={localPosition.slide}
					pollDefinitions={livePolls}
					reactions={liveSession.reactions}
					createPoll={liveSession.createPoll}
					vote={liveSession.vote}
					sendReaction={liveSession.sendReaction}
					closePoll={liveSession.closePoll}
					resetPoll={liveSession.resetPoll}
				/>
			) : null}
		</div>
	);
}

function SlideDeckLoader({
	module,
	presenterMode,
	initialSlide,
	initialStep,
	controlledSlide,
	controlledStep,
	disableUserNavigation,
	onNavigate,
}: {
	module: SlideModule;
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
			slides={module.default}
			components={module._components}
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
