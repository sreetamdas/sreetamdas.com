"use client";

/**
 * Client wiring for live slide sessions. A `live` URL param joins a Durable
 * Object room; `master=1` makes the tab the presenter controller, while normal
 * viewers follow the presenter's slide/step and can vote in the active poll.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { cn } from "@/lib/helpers/utils";

export type SlideSessionRole = "master" | "viewer";

export type SlideSessionSnapshot = {
	type: "snapshot";
	position: {
		slide: number;
		step: number;
		updatedAt: number;
	};
	poll: SlidePoll | null;
	viewers: number;
	masters: number;
};

export type SlidePoll = {
	id: string;
	question: string;
	open: boolean;
	options: Array<{
		id: string;
		label: string;
		votes: number;
	}>;
};

type UseSlideSessionParams = {
	sessionId: string | undefined;
	role: SlideSessionRole;
	localSlide: number;
	localStep: number;
	onRemoteNavigate: (slide: number, step: number) => void;
};

type OutgoingMessage =
	| { type: "set-slide"; slide: number; step: number }
	| { type: "create-poll"; question: string; options: Array<string> }
	| { type: "vote"; pollId: string; optionId: string }
	| { type: "close-poll" }
	| { type: "reset-poll" };

const CLIENT_ID_KEY = "slides-live-client-id";
const PING_INTERVAL_MS = 30_000;

export function useSlideSession({
	sessionId,
	role,
	localSlide,
	localStep,
	onRemoteNavigate,
}: UseSlideSessionParams) {
	const [snapshot, setSnapshot] = useState<SlideSessionSnapshot | null>(null);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const pingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
	const lastSentPositionRef = useRef("");
	const onRemoteNavigateRef = useRef(onRemoteNavigate);
	onRemoteNavigateRef.current = onRemoteNavigate;

	const send = useCallback((message: OutgoingMessage) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return;
		ws.send(JSON.stringify(message));
	}, []);

	useEffect(() => {
		if (!sessionId) return;

		let cancelled = false;
		const wsUrl = getSlideSessionWsUrl(sessionId, role, getClientId());
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		function clearPingTimer() {
			if (pingTimerRef.current) {
				clearInterval(pingTimerRef.current);
				pingTimerRef.current = undefined;
			}
		}

		ws.onopen = () => {
			if (cancelled) return;
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
			if (cancelled || typeof event.data !== "string") return;
			let parsed: unknown;
			try {
				parsed = JSON.parse(event.data);
			} catch {
				return;
			}
			if (!isSlideSessionSnapshot(parsed)) return;

			setSnapshot(parsed);
			if (role === "viewer") {
				onRemoteNavigateRef.current(parsed.position.slide, parsed.position.step);
			}
		};

		ws.onclose = () => {
			if (cancelled) return;
			setConnected(false);
			clearPingTimer();
		};

		ws.onerror = () => {
			if (cancelled) return;
			setConnected(false);
		};

		return () => {
			cancelled = true;
			clearPingTimer();
			setConnected(false);
			wsRef.current = null;
			try {
				ws.close();
			} catch {
				// noop
			}
		};
	}, [role, sessionId]);

	useEffect(() => {
		if (!sessionId || role !== "master" || !connected) return;
		const key = `${localSlide}:${localStep}`;
		if (lastSentPositionRef.current === key) return;
		lastSentPositionRef.current = key;
		send({ type: "set-slide", slide: localSlide, step: localStep });
	}, [connected, localSlide, localStep, role, send, sessionId]);

	return useMemo(
		() => ({
			connected,
			snapshot,
			createPoll: (question: string, options: Array<string>) =>
				send({ type: "create-poll", question, options }),
			vote: (pollId: string, optionId: string) => send({ type: "vote", pollId, optionId }),
			closePoll: () => send({ type: "close-poll" }),
			resetPoll: () => send({ type: "reset-poll" }),
		}),
		[connected, send, snapshot],
	);
}

export function SlideSessionOverlay({
	sessionId,
	role,
	connected,
	snapshot,
	createPoll,
	vote,
	closePoll,
	resetPoll,
}: {
	sessionId: string;
	role: SlideSessionRole;
	connected: boolean;
	snapshot: SlideSessionSnapshot | null;
	createPoll: (question: string, options: Array<string>) => void;
	vote: (pollId: string, optionId: string) => void;
	closePoll: () => void;
	resetPoll: () => void;
}) {
	const [question, setQuestion] = useState("");
	const [options, setOptions] = useState("Yes,No");
	const viewerLink = typeof window === "undefined" ? "" : getViewerLink(sessionId);
	const totalVotes = snapshot?.poll?.options.reduce((sum, option) => sum + option.votes, 0) ?? 0;

	function handleCreatePoll(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const cleanOptions = options
			.split(",")
			.map((option) => option.trim())
			.filter(Boolean);
		createPoll(question, cleanOptions);
		setQuestion("");
	}

	return (
		<div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center text-sm">
			<div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/20 bg-black/80 p-4 text-white shadow-2xl backdrop-blur">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="m-0 font-mono text-xs tracking-[0.25em] text-white/50 uppercase">
							{role === "master" ? "Presenter control" : "Live viewer"}
						</p>
						<p className="m-0 mt-1">
							<code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">{sessionId}</code>{" "}
							· {connected ? "connected" : "connecting"} · {snapshot?.viewers ?? 0} viewers
						</p>
					</div>
					{role === "viewer" ? (
						<p className="m-0 rounded-full bg-white/10 px-3 py-1 text-xs">
							Slides are controlled by the presenter
						</p>
					) : null}
				</div>

				{role === "master" ? (
					<div className="mt-3 rounded-xl bg-white/10 p-3">
						<p className="m-0 text-xs text-white/70">Viewer link</p>
						<code className="mt-1 block overflow-x-auto rounded bg-black/30 p-2 text-xs">
							{viewerLink}
						</code>
					</div>
				) : null}

				{snapshot?.poll ? (
					<PollPanel
						poll={snapshot.poll}
						role={role}
						totalVotes={totalVotes}
						vote={vote}
						closePoll={closePoll}
						resetPoll={resetPoll}
					/>
				) : role === "master" ? (
					<form className="mt-3 grid gap-2" onSubmit={handleCreatePoll}>
						<input
							className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40"
							placeholder="Poll question"
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
						/>
						<input
							className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40"
							placeholder="Comma-separated options"
							value={options}
							onChange={(event) => setOptions(event.target.value)}
						/>
						<button className="bg-primary text-background rounded-lg px-3 py-2" type="submit">
							Start poll
						</button>
					</form>
				) : null}
			</div>
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
	vote: (pollId: string, optionId: string) => void;
	closePoll: () => void;
	resetPoll: () => void;
}) {
	return (
		<div className="mt-3 rounded-xl bg-white/10 p-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="m-0 font-semibold">{poll.question}</p>
					<p className="m-0 mt-1 text-xs text-white/60">
						{poll.open ? "Poll is open" : "Poll is closed"} · {totalVotes} votes
					</p>
				</div>
				{role === "master" ? (
					<div className="flex gap-2">
						<button
							className="rounded bg-white/10 px-2 py-1 text-xs"
							onClick={closePoll}
							type="button"
						>
							Close
						</button>
						<button
							className="rounded bg-white/10 px-2 py-1 text-xs"
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
								"relative overflow-hidden rounded-lg border border-white/20 px-3 py-2 text-left",
								poll.open && role === "viewer" ? "hover:border-white/60" : "cursor-default",
							)}
							disabled={!poll.open || role === "master"}
							key={option.id}
							onClick={() => vote(poll.id, option.id)}
							type="button"
						>
							<span
								className="bg-primary/30 absolute inset-y-0 left-0"
								style={{ width: `${percent}%` }}
							/>
							<span className="relative flex justify-between gap-3">
								<span>{option.label}</span>
								<span>{percent}%</span>
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function getSlideSessionWsUrl(sessionId: string, role: SlideSessionRole, clientId: string) {
	const url = new URL(`/api/slides/session/${encodeURIComponent(sessionId)}`, window.location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.searchParams.set("role", role);
	url.searchParams.set("client", clientId);
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

function isSlideSessionSnapshot(value: unknown): value is SlideSessionSnapshot {
	if (typeof value !== "object" || value === null) return false;
	if (!("type" in value) || value.type !== "snapshot") return false;
	if (!("position" in value) || !isPosition(value.position)) return false;
	if (!("poll" in value) || (value.poll !== null && !isPoll(value.poll))) return false;
	return (
		"viewers" in value &&
		"masters" in value &&
		typeof value.viewers === "number" &&
		typeof value.masters === "number"
	);
}

function isPosition(value: unknown): value is SlideSessionSnapshot["position"] {
	return (
		typeof value === "object" &&
		value !== null &&
		"slide" in value &&
		"step" in value &&
		"updatedAt" in value &&
		typeof value.slide === "number" &&
		typeof value.step === "number" &&
		typeof value.updatedAt === "number"
	);
}

function isPoll(value: unknown): value is SlidePoll {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"question" in value &&
		"open" in value &&
		"options" in value &&
		typeof value.id === "string" &&
		typeof value.question === "string" &&
		typeof value.open === "boolean" &&
		Array.isArray(value.options) &&
		value.options.every(isPollOption)
	);
}

function isPollOption(value: unknown): value is SlidePoll["options"][number] {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"label" in value &&
		"votes" in value &&
		typeof value.id === "string" &&
		typeof value.label === "string" &&
		typeof value.votes === "number"
	);
}
