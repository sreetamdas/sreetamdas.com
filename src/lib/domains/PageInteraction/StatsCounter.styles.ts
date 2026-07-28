/**
 * Class names shared by `StatsCounter` and the lazily loaded
 * `StatsCounterLiveStat`, so the two stat rows cannot drift apart.
 */

export const statItemClassName = "flex items-center justify-center gap-1.5";
export const statValueClassName = "inline-block min-w-[2ch] text-left tabular-nums";
export const statTooltipTriggerClassName = "group relative";

// No opacity transition: these stats mount as their metrics arrive client-side,
// and a transition on the freshly-inserted tooltip animates opacity 1→0 (a flash
// without hover), so the tooltip just shows/hides instantly on hover.
//
// The bubble is centred on its trigger, and the live-viewer stat sits at the end
// of the row, so on narrow viewports half of a 16rem bubble is wider than the gap
// to the right edge and pushes `main` into horizontal overflow. Cap the width
// below `sm` where the room runs out; wider screens keep the full 16rem.
export const statTooltipBubbleClassName =
	"pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-44 -translate-x-1/2 rounded-global border border-solid border-foreground/15 bg-background px-2.5 py-1.5 text-center text-xs leading-snug text-foreground opacity-0 shadow-lg group-hover:opacity-100 group-focus-within:opacity-100 sm:max-w-64";
