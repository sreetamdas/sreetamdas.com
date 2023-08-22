import { clsx } from "clsx";
import { useState } from "react";

import { type FoobarFlag, FOOBAR_FLAGS } from "./flags";
import { type FoobarDataType } from "./store";

import { LinkTo } from "@/lib/components/Anchor";

type ShowCompletedBadgesProps = Pick<FoobarDataType, "completed" | "all_achievements">;
export const ShowCompletedBadges = ({ completed, all_achievements }: ShowCompletedBadgesProps) => {
	const all_badges = Object.values(FOOBAR_FLAGS).map(({ name }) => name);

	return (
		<div>
			<h2 className="pt-24 font-serif text-4xl leading-normal">Completed challenges</h2>
			<p className="my-4">
				Here are badges for all the challenges that you&apos;ve completed so far.
				<br />
				Feel free to{" "}
				<LinkTo href="https://twitter.com/messages/compose?recipient_id=520276345" target="_blank">
					reach out to me
				</LinkTo>{" "}
				if you&apos;d like a clue or have any feedback!
				<br />
				<span className="text-xs italic opacity-50">
					Hint: you can click on a badge <code>5</code> times to reveal how to get it
				</span>
			</p>
			<div className="grid gap-6 py-12 md:grid-cols-2">
				{all_badges.map((badge) => (
					<Badge
						key={badge}
						badge={badge}
						completed={completed}
						all_achievements={all_achievements}
					/>
				))}
			</div>
		</div>
	);
};

type BadgeProps = {
	badge: FoobarFlag;
} & Pick<FoobarDataType, "completed" | "all_achievements">;
const Badge = ({ badge, completed, all_achievements }: BadgeProps) => {
	const [clicks, setClicks] = useState(0);
	const is_unlocked = badge === "completed" ? all_achievements : completed.includes(badge);

	return (
		<button
			onClick={() => setClicks(clicks + 1)}
			className={clsx(
				"group grid grid-cols-[max-content_1fr] items-center gap-4 rounded-global border-2 p-4 text-4xl transition-colors",
				is_unlocked ? "border-primary text-primary" : "border-zinc-400 text-zinc-400",
			)}
		>
			<FoobarBadge badge={badge} />
			<p className={clsx("text-sm", is_unlocked || clicks >= 5 ? "inline" : "hidden")}>
				{FOOBAR_FLAGS[badge].description}
			</p>
		</button>
	);
};

const FoobarBadge = ({ badge }: { badge: FoobarFlag }) => {
	const { icon: Icon } = FOOBAR_FLAGS[badge];
	return <Icon aria-label={badge} className="text-5xl" />;
};
