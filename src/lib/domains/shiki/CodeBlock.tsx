import { isObject } from "lodash-es";
import {
	Children,
	type CSSProperties,
	type DetailedHTMLProps,
	type HTMLAttributes,
	isValidElement,
	type ReactNode,
	useState,
} from "react";
import { FaChevronDown } from "react-icons/fa";

import { cn } from "@/lib/helpers/utils";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode;
	language?: string;
	highlight?: string;
	"hide-line-numbers"?: "true";
	filename?: string;

	className?: string;
	style?: CSSProperties;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const {
		children: code,
		style,
		"hide-line-numbers": hide_line_numbers = false,
		filename = null,
	} = props;

	if (!isValidElement(code)) {
		return null;
	}

	const {
		// @ts-expect-error child props is not unknown
		props: { children: code_children_raw, className: _, "data-language": code_lang },
	} = code;
	const code_children = Children.toArray(code_children_raw).filter((line) => line !== "\n");

	const [is_block_expanded, setBlockExpanded] = useState(false);
	const allow_block_expand = code_children.length > 40;

	function toggleExpand() {
		setBlockExpanded((x) => !x);
	}

	return (
		<figure className="my-5 flex flex-col">
			<div
				className="rounded-tl-global rounded-tr-global -mx-4 grid grid-flow-col overflow-x-scroll pr-2 pl-2 sm:-mr-5 sm:-ml-12 sm:pr-5 sm:pl-12"
				style={style}
			>
				{filename !== null ? (
					<span className="rounded-t-global justify-self-start py-1 font-mono text-zinc-400 max-sm:text-xs">
						{filename}
					</span>
				) : null}
				{allow_block_expand || code_lang !== "plain" ? (
					<span className="grid grid-flow-col items-center gap-8 justify-self-end">
						{allow_block_expand ? (
							<button
								className="rounded-global text-background h-fit justify-self-end bg-zinc-700 px-1 font-mono text-xs transition-colors hover:bg-zinc-600 sm:text-sm"
								onClick={toggleExpand}
							>
								toggle expand
							</button>
						) : null}
						{code_lang !== "plain" ? (
							<span className="rounded-t-global justify-self-end py-1 font-mono text-zinc-400 max-sm:text-xs">
								{code_lang}
							</span>
						) : null}
					</span>
				) : null}
			</div>
			<pre
				className={cn(
					"-mx-4 overflow-x-scroll p-5 text-xs max-sm:px-2 sm:-mr-5 sm:-ml-12 sm:text-sm max-sm:[&>code>.block>.line]:whitespace-pre-wrap",
					filename === null && code_lang === "plain" && "rounded-global",
					is_block_expanded
						? "rounded-bl-global rounded-br-global"
						: "max-h-[calc(100svh-120px-40px)]",
				)}
				style={style}
			>
				<code>
					<CodeBlockChildren hide_line_numbers={hide_line_numbers === "true"}>
						{code_children}
					</CodeBlockChildren>
				</code>
			</pre>
			{allow_block_expand && !is_block_expanded ? (
				<div className="rounded-bl-global rounded-br-global sm:-mr-5 sm:-ml-12" style={style}>
					<button
						className="flex w-full justify-center px-5 py-2 text-xs text-zinc-400 transition-[color] hover:text-zinc-200 max-sm:px-2"
						onClick={toggleExpand}
					>
						<FaChevronDown />
					</button>
				</div>
			) : null}
		</figure>
	);
};

type CodeBlockChildrenProps = { children: ReactNode; hide_line_numbers?: boolean };
const CodeBlockChildren = ({ children, hide_line_numbers }: CodeBlockChildrenProps) => {
	if (typeof children === "string") {
		return children.split("\n").map((line, index) => (
			<span key={index} className="block">
				{line}
			</span>
		));
	}

	return (
		Children.toArray(children)
			// .filter((line) => line !== "\n")
			.map((line, i) => {
				const should_line_highlight =
					// @ts-expect-error line props is not unknown
					isObject(line) && "props" in line && (line.props["data-highlight"] ?? "false") === "true";

				return (
					<span
						key={i}
						className={cn(
							"block",
							should_line_highlight && "-mx-5 border-l-4 border-[#a86efd] bg-[#d0b2ff1a] px-4",
							hide_line_numbers && "pl-8",
						)}
					>
						{hide_line_numbers ? null : (
							<span
								className={cn(
									"inline-block w-0 text-right text-zinc-600 select-none max-sm:opacity-0 sm:mr-2 sm:-ml-2 sm:w-8 sm:pr-2",
									should_line_highlight && "text-[#a86efd]",
								)}
								aria-hidden="true"
							>
								{i + 1}
							</span>
						)}
						{line}
					</span>
				);
			})
	);
};
