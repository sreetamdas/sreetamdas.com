import { clsx } from "clsx";
import { isNull, isObject, isUndefined } from "lodash-es";
import { type DetailedHTMLProps, type HTMLAttributes, type ReactNode } from "react";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode | string | null;
	language?: string;
	highlight?: string;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const { language = "js", children: codeElement, highlight, style } = props;
	const shouldHighlightLine = calculateLinesToHighlight(highlight);

	let children: string | ReactNode;

	if (typeof codeElement === "string") {
		children = codeElement;
	} else if (
		!isUndefined(codeElement) &&
		!isNull(codeElement) &&
		isObject(codeElement) &&
		"props" in codeElement
	) {
		children = codeElement?.props.children;
	}
	if (!Array.isArray(children)) {
		children = [children];
	}

	return (
		<pre
			className="my-5 -ml-12 -mr-5 overflow-x-scroll rounded-global p-5 text-sm max-md:-ml-6"
			style={style}
		>
			<span className="float-right -mt-5 rounded-b-global bg-zinc-800 px-1 py-2 text-zinc-400">
				{language.toLocaleUpperCase()}
			</span>
			{Array.isArray(children) ? (
				<code>
					{children
						?.filter((line) => line !== "\n")
						.map((line, i) => (
							<span
								key={i}
								className={clsx(
									"block",
									shouldHighlightLine(i) && "-mx-5 border-l-4 border-[#a86efd] bg-[#FFFFFF20] px-4"
								)}
							>
								<span
									className={clsx(
										"-ml-2 mr-2 hidden w-[2rem] select-none pr-2 text-right text-zinc-600 md:inline-block",
										shouldHighlightLine(i) && "text-[#a86efd]"
									)}
								>
									{i + 1}
								</span>
								{line}
							</span>
						))}
				</code>
			) : (
				"asd"
			)}
		</pre>
	);
};

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang highlight="2,4-5"
 */
const RE_LINE_HIGHLIGHT = /([\d,-]+)/;
function calculateLinesToHighlight(meta = "") {
	const regExpExecArray = RE_LINE_HIGHLIGHT.exec(meta);

	if (!RE_LINE_HIGHLIGHT.test(meta) || regExpExecArray === null) {
		return () => false;
	} else {
		const lineNumbers = regExpExecArray[1]
			.split(",")
			.map((v) => v.split("-").map((v) => parseInt(v, 10)));

		return (index: number) => {
			const lineNumber = index + 1;
			const inRange = lineNumbers.some(([start, end]) =>
				end ? lineNumber >= start && lineNumber <= end : lineNumber === start
			);

			return inRange;
		};
	}
}
