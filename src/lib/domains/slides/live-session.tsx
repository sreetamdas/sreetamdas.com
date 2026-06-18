"use client";

/**
 * Presenter and viewer overlay UI for live slide sessions. Presenters
 * (`master=1`) get poll controls and see aggregated reactions; viewers follow
 * the presenter's slide, vote in slide polls, and send lightweight reactions.
 * The underlying WebSocket transport lives in `./use-slide-session`.
 */
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, useState } from "react";
import { FaCloudflare, FaGoogle, FaRegCircleCheck } from "react-icons/fa6";

import { startSocialSignInServerFn, type SocialSignInProvider } from "@/lib/domains/auth/server";
import { SLIDE_REACTION_EMOJIS } from "@/lib/domains/slides/reactions";
import { cn } from "@/lib/helpers/utils";

import {
	type SlidePoll,
	type SlideSessionReaction,
	type SlideSessionRole,
	type SlideSessionSnapshot,
} from "./live-session-protocol";
import { useBrowserHref } from "./use-slide-session";

export type {
	SlidePoll,
	SlideSessionReaction,
	SlideSessionRole,
	SlideSessionSnapshot,
} from "./live-session-protocol";

export type SlideSessionPollDefinition = {
	slide: number;
	question: string;
	options: Array<string>;
};

export function SlideSessionOverlay({
	sessionId,
	role,
	connected,
	snapshot,
	currentSlide,
	pollDefinitions = [],
	reactions,
	createPoll,
	vote,
	sendReaction,
	closePoll,
	resetPoll,
}: {
	sessionId: string;
	role: SlideSessionRole;
	connected: boolean;
	snapshot: SlideSessionSnapshot | null;
	currentSlide: number;
	pollDefinitions?: Array<SlideSessionPollDefinition>;
	reactions: Array<SlideSessionReaction>;
	createPoll: (question: string, options: Array<string>, slide?: number | null) => void;
	vote: (pollId: string, optionId: string) => void;
	sendReaction: (emoji: string) => void;
	closePoll: () => void;
	resetPoll: () => void;
}) {
	const [open, setOpen] = useState(false);
	const activeSlide = role === "viewer" ? (snapshot?.position.slide ?? currentSlide) : currentSlide;
	const visiblePoll = getVisiblePoll(snapshot?.poll ?? null, role, activeSlide);
	const slidePolls = pollDefinitions.filter((poll) => poll.slide === activeSlide);
	const totalVotes = visiblePoll?.options.reduce((sum, option) => sum + option.votes, 0) ?? 0;

	return (
		<>
			{role === "master" ? <ReactionCluster reactions={reactions} /> : null}
			<div className="pointer-events-none fixed right-4 bottom-4 z-50 text-sm">
				{role === "master" ? (
					<MasterLiveControl
						connected={connected}
						createPoll={createPoll}
						currentSlide={activeSlide}
						open={open}
						poll={visiblePoll}
						resetPoll={resetPoll}
						closePoll={closePoll}
						sessionId={sessionId}
						setOpen={setOpen}
						slidePolls={slidePolls}
						snapshot={snapshot}
						totalVotes={totalVotes}
					/>
				) : (
					<ViewerLiveButton
						connected={connected}
						open={open}
						poll={visiblePoll}
						sendReaction={sendReaction}
						setOpen={setOpen}
						snapshot={snapshot}
						totalVotes={totalVotes}
						vote={vote}
					/>
				)}
			</div>
		</>
	);
}

function MasterLiveControl({
	connected,
	createPoll,
	currentSlide,
	open,
	poll,
	resetPoll,
	closePoll,
	sessionId,
	setOpen,
	slidePolls,
	snapshot,
	totalVotes,
}: {
	connected: boolean;
	createPoll: (question: string, options: Array<string>, slide?: number | null) => void;
	currentSlide: number;
	open: boolean;
	poll: SlidePoll | null;
	resetPoll: () => void;
	closePoll: () => void;
	sessionId: string;
	setOpen: (open: boolean) => void;
	slidePolls: Array<SlideSessionPollDefinition>;
	snapshot: SlideSessionSnapshot | null;
	totalVotes: number;
}) {
	const [question, setQuestion] = useState("");
	const [options, setOptions] = useState("Yes,No");
	const [signInProvider, setSignInProvider] = useState<SocialSignInProvider | null>(null);
	const [signInFailed, setSignInFailed] = useState(false);
	const startSocialSignIn = useServerFn(startSocialSignInServerFn);
	const browserHref = useBrowserHref();
	const viewerLink = browserHref ? getViewerLink(sessionId, browserHref) : "";
	const signInDisabled = !browserHref || signInProvider !== null;

	async function handleSocialSignin(provider: SocialSignInProvider) {
		if (!browserHref || signInProvider) return;

		setSignInProvider(provider);
		setSignInFailed(false);
		try {
			const result = await startSocialSignIn({
				data: { provider, return_url: browserHref },
			});
			globalThis.location.assign(result.url);
		} catch {
			setSignInFailed(true);
			setSignInProvider(null);
		}
	}

	function handleCreatePoll(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const cleanOptions = options
			.split(",")
			.map((option) => option.trim())
			.filter(Boolean);
		createPoll(question, cleanOptions, currentSlide);
		setQuestion("");
	}

	if (!open) {
		return (
			<button
				className="pointer-events-auto rounded-full border border-white/15 bg-black/75 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm transition hover:bg-black/90"
				onClick={() => setOpen(true)}
				type="button"
			>
				Live · {connected ? "on" : "…"} · {snapshot?.viewers ?? 0} viewers
			</button>
		);
	}

	return (
		<div className="pointer-events-auto w-80 rounded-2xl border border-white/15 bg-black/80 p-3 text-white shadow-2xl backdrop-blur-sm">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="m-0 font-mono text-[0.65rem] tracking-[0.22em] text-white/50 uppercase">
						Presenter
					</p>
					<p className="m-0 mt-1 text-xs text-white/70">
						Slide {currentSlide + 1} · {connected ? "connected" : "connecting"} ·{" "}
						{snapshot?.viewers ?? 0} viewers
					</p>
				</div>
				<button
					className="rounded-full bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
					onClick={() => setOpen(false)}
					type="button"
				>
					Hide
				</button>
			</div>
			{connected ? null : (
				<div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-2">
					<p className="m-0 text-xs text-amber-50/85">
						Presenter control requires an allowlisted login.
					</p>
					<p className="m-0 flex items-center gap-2 pt-5 text-xs text-amber-50/85">
						Sign in with:
						<button
							aria-label="Sign in with Cloudflare"
							className="cursor-pointer border-0 bg-transparent p-0 text-2xl text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={signInDisabled}
							onClick={() => void handleSocialSignin("cloudflare")}
							type="button"
						>
							<FaCloudflare />
						</button>
						<button
							aria-label="Sign in with Google"
							className="cursor-pointer border-0 bg-transparent p-0 text-lg text-white disabled:cursor-not-allowed disabled:opacity-50"
							disabled={signInDisabled}
							onClick={() => void handleSocialSignin("google")}
							type="button"
						>
							<FaGoogle />
						</button>
					</p>
					{signInFailed ? (
						<p className="m-0 mt-2 text-xs text-amber-50/85">
							Sign-in failed. Try again in a moment.
						</p>
					) : null}
				</div>
			)}

			<div className="mt-3 rounded-xl bg-white/10 p-2">
				<p className="m-0 text-[0.65rem] text-white/60 uppercase">Viewer link</p>
				<code className="mt-1 block max-h-12 overflow-auto text-[0.65rem] break-all text-white/80">
					{viewerLink}
				</code>
			</div>

			{poll ? (
				<PollPanel
					closePoll={closePoll}
					poll={poll}
					resetPoll={resetPoll}
					role="master"
					totalVotes={totalVotes}
				/>
			) : (
				<div className="mt-3 grid gap-2">
					{slidePolls.length > 0 ? (
						<div className="rounded-xl bg-white/10 p-2">
							<p className="m-0 text-[0.65rem] text-white/60 uppercase">Slide polls</p>
							<div className="mt-2 grid gap-2">
								{slidePolls.map((slidePoll) => (
									<button
										className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-left text-xs hover:bg-white/20"
										key={`${slidePoll.slide}:${slidePoll.question}`}
										onClick={() =>
											createPoll(slidePoll.question, slidePoll.options, slidePoll.slide)
										}
										type="button"
									>
										{slidePoll.question}
									</button>
								))}
							</div>
						</div>
					) : null}
					<form className="grid gap-2" onSubmit={handleCreatePoll}>
						<input
							className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/40"
							placeholder="Custom poll question"
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
						/>
						<input
							className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/40"
							placeholder="Comma-separated options"
							value={options}
							onChange={(event) => setOptions(event.target.value)}
						/>
						<button
							className="rounded-lg bg-primary px-3 py-2 text-xs text-background"
							type="submit"
						>
							Start poll for this slide
						</button>
					</form>
				</div>
			)}
		</div>
	);
}

function ViewerLiveButton({
	connected,
	open,
	poll,
	sendReaction,
	setOpen,
	snapshot,
	totalVotes,
	vote,
}: {
	connected: boolean;
	open: boolean;
	poll: SlidePoll | null;
	sendReaction: (emoji: string) => void;
	setOpen: (open: boolean) => void;
	snapshot: SlideSessionSnapshot | null;
	totalVotes: number;
	vote: (pollId: string, optionId: string) => void;
}) {
	return (
		<div className="pointer-events-auto flex flex-col items-end gap-2">
			{open ? (
				<div className="w-72 rounded-2xl border border-white/15 bg-black/80 p-3 text-white shadow-2xl backdrop-blur-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="m-0 font-mono text-[0.65rem] tracking-[0.22em] text-white/50 uppercase">
								Live
							</p>
							<p className="m-0 mt-1 text-xs text-white/70">
								{connected ? "connected" : "connecting"} · {snapshot?.viewers ?? 0} viewers
							</p>
						</div>
						<button
							className="rounded-full bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
							onClick={() => setOpen(false)}
							type="button"
						>
							Hide
						</button>
					</div>
					<div className="mt-3 flex gap-2">
						{SLIDE_REACTION_EMOJIS.map((emoji) => (
							<button
								className="rounded-full bg-white/10 px-2 py-1 text-base hover:bg-white/20"
								key={emoji}
								onClick={() => sendReaction(emoji)}
								type="button"
							>
								{emoji}
							</button>
						))}
					</div>
					{poll ? (
						<PollPanel poll={poll} role="viewer" totalVotes={totalVotes} vote={vote} />
					) : (
						<p className="m-0 mt-3 text-xs text-white/60">
							Slides are controlled by the presenter.
						</p>
					)}
				</div>
			) : null}
			<button
				className={cn(
					"rounded-full border border-white/15 bg-black/75 px-3 py-2 text-sm text-white shadow-xl backdrop-blur-sm transition hover:bg-black/90",
					poll ? "ring-2 ring-primary" : "",
				)}
				onClick={() => setOpen(!open)}
				type="button"
			>
				{poll ? "Poll" : "React"} · {connected ? "Live" : "…"}
			</button>
		</div>
	);
}

function PollPanel({
	poll,
	role,
	totalVotes,
	vote,
	closePoll,
	resetPoll,
}: {
	poll: SlidePoll;
	role: SlideSessionRole;
	totalVotes: number;
	vote?: (pollId: string, optionId: string) => void;
	closePoll?: () => void;
	resetPoll?: () => void;
}) {
	return (
		<div className="mt-3 rounded-xl bg-white/10 p-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="m-0 text-sm font-semibold">{poll.question}</p>
					<p className="m-0 mt-1 text-xs text-white/60">
						{poll.open ? "Open" : "Closed"} · {totalVotes} votes
						{poll.slide === null ? "" : ` · slide ${poll.slide + 1}`}
					</p>
				</div>
				{role === "master" ? (
					<div className="flex gap-2">
						<button
							className="rounded-sm bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
							onClick={closePoll}
							type="button"
						>
							Close
						</button>
						<button
							className="rounded-sm bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
							onClick={resetPoll}
							type="button"
						>
							Reset
						</button>
					</div>
				) : null}
			</div>
			<div className="mt-3 grid gap-2">
				{poll.options.map((option) => {
					const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
					return (
						<button
							className={cn(
								"relative overflow-hidden rounded-lg border border-white/15 px-3 py-2 text-left text-xs",
								poll.open && role === "viewer" ? "hover:border-white/60" : "cursor-default",
								option.id === poll.selectedOptionId ? "border-primary ring-1 ring-primary/50" : "",
							)}
							disabled={!poll.open || role === "master"}
							key={option.id}
							onClick={() => vote?.(poll.id, option.id)}
							type="button"
						>
							<span
								className="absolute inset-y-0 left-0 bg-primary/30"
								style={{ width: `${percent}%` }}
							/>
							<span className="relative flex justify-between gap-3">
								<span className="flex items-center gap-2">
									{option.id === poll.selectedOptionId ? (
										<FaRegCircleCheck
											aria-label="Selected option"
											className="text-sm text-primary"
										/>
									) : null}
									<span>{option.label}</span>
								</span>
								<span>{percent}%</span>
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function ReactionCluster({ reactions }: { reactions: Array<SlideSessionReaction> }) {
	const counts = SLIDE_REACTION_EMOJIS.map((emoji) => ({
		emoji,
		count: reactions.filter((reaction) => reaction.emoji === emoji).length,
	})).filter((reaction) => reaction.count > 0);

	if (counts.length === 0) return null;

	return (
		<div className="pointer-events-none fixed bottom-4 left-4 z-40 flex flex-wrap gap-2">
			{counts.map((reaction) => (
				<div
					className="animate-[reactionCountPulse_350ms_ease-out] rounded-full border border-white/15 bg-black/75 px-3 py-2 text-lg text-white shadow-xl backdrop-blur-sm"
					key={`${reaction.emoji}:${reaction.count}`}
				>
					<span aria-hidden="true">{reaction.emoji}</span>
					{reaction.count > 1 ? (
						<span className="ml-1 font-mono text-xs text-white/70">x{reaction.count}</span>
					) : null}
				</div>
			))}
		</div>
	);
}

function getVisiblePoll(poll: SlidePoll | null, role: SlideSessionRole, currentSlide: number) {
	if (!poll) return null;
	if (role === "master") return poll;
	if (poll.slide === null || poll.slide === currentSlide) return poll;
	return null;
}

function getViewerLink(sessionId: string, url: string) {
	const updated_url = new URL(url);

	updated_url.searchParams.set("live", sessionId);
	updated_url.searchParams.delete("master");
	updated_url.searchParams.delete("presenter");
	return updated_url.toString();
}
