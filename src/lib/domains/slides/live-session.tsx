"use client";

/**
 * Client wiring for live slide sessions. A `live` URL param joins a Durable
 * Object room; `master=1` makes the tab the presenter controller, while normal
 * viewers follow the presenter's slide/step, vote in slide polls, and send
 * lightweight reactions that briefly appear on the presenter's screen.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";

import { SLIDE_REACTION_EMOJIS } from "@/lib/domains/slides/reactions";
import { cn } from "@/lib/helpers/utils";

import {
	isSlideSessionReaction,
	isSlideSessionSnapshot,
	type SlidePoll,
	type SlideSessionOutgoingMessage,
	type SlideSessionReaction,
	type SlideSessionRole,
	type SlideSessionSnapshot,
} from "./live-session-protocol";

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

type UseSlideSessionParams = {
	sessionId: string | undefined;
	role: SlideSessionRole;
	localSlide: number;
	localStep: number;
	onRemoteNavigate: (slide: number, step: number) => void;
};

const CLIENT_ID_KEY = "slides-live-client-id";
const PING_INTERVAL_MS = 30_000;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 5_000;
const SNAPSHOT_POLL_MS = 1_000;
const REACTION_TTL_MS = 4_000;

export function useSlideSession({
	sessionId,
	role,
	localSlide,
	localStep,
	onRemoteNavigate,
}: UseSlideSessionParams) {
	const [snapshot, setSnapshot] = useState<SlideSessionSnapshot | null>(null);
	const [connected, setConnected] = useState(false);
	const [reactions, setReactions] = useState<Array<SlideSessionReaction>>([]);
	const wsRef = useRef<WebSocket | null>(null);
	const pingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
	const lastSentPositionRef = useRef("");
	const onRemoteNavigateRef = useRef(onRemoteNavigate);
	onRemoteNavigateRef.current = onRemoteNavigate;

	const send = useCallback((message: SlideSessionOutgoingMessage) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(message));
		return true;
	}, []);

	useEffect(() => {
		if (!sessionId) return;

		const liveSessionId = sessionId;
		let cancelled = false;
		let reconnectAttempt = 0;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

		function clearPingTimer() {
			if (pingTimerRef.current) {
				clearInterval(pingTimerRef.current);
				pingTimerRef.current = undefined;
			}
		}

		function clearReconnectTimer() {
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = undefined;
			}
		}

		function scheduleReconnect() {
			if (cancelled) return;
			clearReconnectTimer();
			const delay = Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempt, RECONNECT_MAX_MS);
			reconnectAttempt += 1;
			reconnectTimer = setTimeout(connect, delay);
		}

		function connect() {
			clearReconnectTimer();
			clearPingTimer();
			const wsUrl = getSlideSessionWsUrl(liveSessionId, role, getClientId());
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelled || wsRef.current !== ws) return;
				reconnectAttempt = 0;
				setConnected(true);
				clearPingTimer();
				pingTimerRef.current = setInterval(() => {
					try {
						ws.send("ping");
					} catch {
						// noop
					}
				}, PING_INTERVAL_MS);
			};

			ws.onmessage = (event) => {
				if (cancelled || wsRef.current !== ws || typeof event.data !== "string") return;
				let parsed: unknown;
				try {
					parsed = JSON.parse(event.data);
				} catch {
					return;
				}

				if (isSlideSessionSnapshot(parsed)) {
					setSnapshot(parsed);
					if (role === "viewer") {
						onRemoteNavigateRef.current(parsed.position.slide, parsed.position.step);
					}
					return;
				}

				if (isSlideSessionReaction(parsed)) {
					setReactions((current) => [...current, parsed]);
				}
			};

			ws.onclose = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
				clearPingTimer();
				scheduleReconnect();
			};

			ws.onerror = () => {
				if (cancelled || wsRef.current !== ws) return;
				setConnected(false);
			};
		}

		connect();

		return () => {
			cancelled = true;
			clearPingTimer();
			clearReconnectTimer();
			setConnected(false);
			const ws = wsRef.current;
			try {
				ws?.close();
			} catch {
				// noop
			}
			wsRef.current = null;
		};
	}, [role, sessionId]);

	useEffect(() => {
		if (!sessionId || role !== "master" || !connected) return;
		const key = `${localSlide}:${localStep}`;
		if (lastSentPositionRef.current === key) return;
		if (send({ type: "set-slide", slide: localSlide, step: localStep })) {
			lastSentPositionRef.current = key;
		}
	}, [connected, localSlide, localStep, role, send, sessionId]);

	useEffect(() => {
		if (!sessionId || role !== "viewer") return;

		let cancelled = false;
		let inFlight = false;
		const snapshotUrl = getSlideSessionHttpUrl(sessionId, getClientId());

		async function refreshSnapshot() {
			if (cancelled || inFlight) return;
			inFlight = true;
			try {
				const response = await fetch(snapshotUrl, { cache: "no-store" });
				const parsed: unknown = await response.json();
				if (cancelled || !isSlideSessionSnapshot(parsed)) return;
				setSnapshot(parsed);
				onRemoteNavigateRef.current(parsed.position.slide, parsed.position.step);
			} catch {
				// The WebSocket remains the primary path; polling is a best-effort safety net.
			} finally {
				inFlight = false;
			}
		}

		void refreshSnapshot();
		const timer = setInterval(() => {
			void refreshSnapshot();
		}, SNAPSHOT_POLL_MS);

		return () => {
			cancelled = true;
			clearInterval(timer);
		};
	}, [role, sessionId]);

	useEffect(() => {
		if (reactions.length === 0) return;
		const timer = setTimeout(() => {
			const now = Date.now();
			setReactions((current) =>
				current.filter((reaction) => now - reaction.createdAt < REACTION_TTL_MS),
			);
		}, REACTION_TTL_MS);
		return () => clearTimeout(timer);
	}, [reactions]);

	return useMemo(
		() => ({
			connected,
			snapshot,
			reactions,
			createPoll: (question: string, options: Array<string>, slide?: number | null) =>
				send({ type: "create-poll", question, options, slide }),
			vote: (pollId: string, optionId: string) => send({ type: "vote", pollId, optionId }),
			sendReaction: (emoji: string) => send({ type: "reaction", emoji }),
			closePoll: () => send({ type: "close-poll" }),
			resetPoll: () => send({ type: "reset-poll" }),
		}),
		[connected, reactions, send, snapshot],
	);
}

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
	const viewerLink = typeof window === "undefined" ? "" : getViewerLink(sessionId);
	const loginLink = typeof window === "undefined" ? "" : getCloudflareLoginLink();

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
				className="pointer-events-auto rounded-full border border-white/15 bg-black/75 px-3 py-2 text-xs text-white shadow-xl backdrop-blur transition hover:bg-black/90"
				onClick={() => setOpen(true)}
				type="button"
			>
				Live · {connected ? "on" : "…"} · {snapshot?.viewers ?? 0} viewers
			</button>
		);
	}

	return (
		<div className="pointer-events-auto w-80 rounded-2xl border border-white/15 bg-black/80 p-3 text-white shadow-2xl backdrop-blur">
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
						Presenter control requires an allowlisted Cloudflare login.
					</p>
					<a
						className="mt-2 inline-flex rounded-lg bg-white/15 px-2 py-1 text-xs text-white no-underline hover:bg-white/25"
						href={loginLink}
					>
						Sign in with Cloudflare
					</a>
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
							className="bg-primary text-background rounded-lg px-3 py-2 text-xs"
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
				<div className="w-72 rounded-2xl border border-white/15 bg-black/80 p-3 text-white shadow-2xl backdrop-blur">
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
					"rounded-full border border-white/15 bg-black/75 px-3 py-2 text-sm text-white shadow-xl backdrop-blur transition hover:bg-black/90",
					poll ? "ring-primary ring-2" : "",
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
							className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
							onClick={closePoll}
							type="button"
						>
							Close
						</button>
						<button
							className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
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
								option.id === poll.selectedOptionId ? "border-primary ring-primary/50 ring-1" : "",
							)}
							disabled={!poll.open || role === "master"}
							key={option.id}
							onClick={() => vote?.(poll.id, option.id)}
							type="button"
						>
							<span
								className="bg-primary/30 absolute inset-y-0 left-0"
								style={{ width: `${percent}%` }}
							/>
							<span className="relative flex justify-between gap-3">
								<span className="flex items-center gap-2">
									{option.id === poll.selectedOptionId ? (
										<FaRegCircleCheck
											aria-label="Selected option"
											className="text-primary text-sm"
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
					className="animate-[reactionCountPulse_350ms_ease-out] rounded-full border border-white/15 bg-black/75 px-3 py-2 text-lg text-white shadow-xl backdrop-blur"
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

function getSlideSessionWsUrl(sessionId: string, role: SlideSessionRole, clientId: string) {
	const url = new URL(`/api/slides/session/${encodeURIComponent(sessionId)}`, window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set("role", role);
	url.searchParams.set("client", clientId);
	return url.toString();
}

function getSlideSessionHttpUrl(sessionId: string, clientId: string) {
	const url = new URL(`/api/slides/session/${encodeURIComponent(sessionId)}`, window.location.href);
	url.searchParams.set("client", clientId);
	return url.toString();
}

function getCloudflareLoginLink() {
	const url = new URL("/api/login/cloudflare", window.location.href);
	url.searchParams.set("returnTo", window.location.href);
	return url.toString();
}

function getViewerLink(sessionId: string) {
	const url = new URL(window.location.href);
	url.searchParams.set("live", sessionId);
	url.searchParams.delete("master");
	url.searchParams.delete("presenter");
	return url.toString();
}

function getClientId() {
	const existing = window.localStorage.getItem(CLIENT_ID_KEY);
	if (existing) return existing;
	const id = crypto.randomUUID();
	window.localStorage.setItem(CLIENT_ID_KEY, id);
	return id;
}
