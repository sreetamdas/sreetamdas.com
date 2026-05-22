"use client";

import { isObject } from "lodash-es";
import {
	Children,
	type CSSProperties,
	type DetailedHTMLProps,
	type HTMLAttributes,
	isValidElement,
	PropsWithChildren,
	type ReactNode,
	useState,
} from "react";
import { FaChevronDown } from "react-icons/fa";

import { cn } from "@/lib/helpers/utils";

type CodeBlockFrameProps = {
	filename: string | null;
	language: string;
	allowBlockExpand: boolean;
	isBlockExpanded: boolean;
	onToggleExpand: () => void;
	preClassName: string;
	preStyle?: CSSProperties;
} & HTMLAttributes<HTMLElement>;

function CodeBlockFrame({
	filename,
	language,
	allowBlockExpand,
	isBlockExpanded,
	onToggleExpand,
	className,
	preClassName,
	preStyle,
	children,
}: CodeBlockFrameProps) {
	return (
		<figure className={cn("my-5 flex flex-col", className)}>
			<div
				className="rounded-tl-global rounded-tr-global -mx-4 grid grid-flow-col overflow-x-scroll pr-2 pl-2 sm:-mr-5 sm:-ml-12 sm:pr-5 sm:pl-12"
				style={preStyle}
			>
				{filename !== null ? (
					<span className="rounded-t-global justify-self-start py-1 font-mono text-zinc-400 max-sm:text-xs">
						{filename}
					</span>
				) : null}
				{allowBlockExpand || language !== "plain" ? (
					<span className="grid grid-flow-col items-center gap-8 justify-self-end">
						{allowBlockExpand ? (
							<button
								className="rounded-global text-background h-fit justify-self-end bg-zinc-700 px-1 font-mono text-xs transition-colors hover:bg-zinc-600 sm:text-sm"
								onClick={onToggleExpand}
							>
								toggle expand
							</button>
						) : null}
						{language !== "plain" ? (
							<span className="rounded-t-global justify-self-end py-1 font-mono text-zinc-400 max-sm:text-xs">
								{language}
							</span>
						) : null}
					</span>
				) : null}
			</div>

			<pre className={preClassName} style={preStyle}>
				{children}
			</pre>

			{allowBlockExpand && !isBlockExpanded ? (
				<div className="rounded-bl-global rounded-br-global sm:-mr-5 sm:-ml-12" style={preStyle}>
					<button
						className="flex w-full justify-center px-5 py-2 text-xs text-zinc-400 transition-[color] hover:text-zinc-200 max-sm:px-2"
						onClick={onToggleExpand}
					>
						<FaChevronDown />
					</button>
				</div>
			) : null}
		</figure>
	);
}

function parseShikiMeta(html: string) {
	const styleMatch = html.match(/style="([^"]*)"/);
	const style: Record<string, string | undefined> = {};
	if (styleMatch) {
		for (const decl of styleMatch[1].split(";")) {
			const [prop, val] = decl.split(":");
			if (prop && val) {
				const camelProp = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
				style[camelProp] = val.trim();
			}
		}
	}

	const langMatch = html.match(/data-language="([^"]*)"/);
	const language = langMatch?.[1] ?? "plain";

	const lineCount = (html.match(/class="line"/g) || []).length;

	return { style: style as CSSProperties, language, lineCount };
}

function extractCodeInner(html: string): string {
	const codeStart = html.indexOf("<code");
	const codeEnd = html.lastIndexOf("</code>");
	if (codeStart === -1 || codeEnd === -1) return html;

	const innerStart = html.indexOf(">", codeStart) + 1;
	const inner = html.slice(innerStart, codeEnd);

	// Only strip newlines that appear between HTML tags (formatting whitespace),
	// not newlines that are part of actual code content within text nodes.
	// Pattern: newline + optional whitespace between closing and opening tags
	const cleaned = inner.replace(/>\n[\t ]*</g, "><").replace(/\n[\t ]*<\/span>/g, "</span>");

	return `<code>${cleaned}</code>`;
}

function parseCodeMeta(meta: string): Record<string, string> {
	const result: Record<string, string> = {};
	const regex = /([\w-]+)(?:="([^"]*)")?/g;
	let match;
	while ((match = regex.exec(meta)) !== null) {
		result[match[1]] = match[2] ?? "true";
	}
	return result;
}

type ShikiCodeBlockProps = {
	html: string;
	meta?: string | null;
	preClassName?: string;
	className?: string;
};

export const ShikiCodeBlock = ({
	html,
	meta,
	className,
	preClassName: passedPreClassName,
}: ShikiCodeBlockProps) => {
	const { style, language, lineCount } = parseShikiMeta(html);
	const parsedMeta = meta ? parseCodeMeta(meta) : {};
	const hideLineNumbers = parsedMeta["hide-line-numbers"] === "true";
	const filename = parsedMeta["filename"] ?? null;

	const [isBlockExpanded, setBlockExpanded] = useState(false);
	const allowBlockExpand = lineCount > 40;

	function toggleExpand() {
		setBlockExpanded((x) => !x);
	}

	const preClassName = cn(
		"-mx-4 overflow-x-scroll p-5 text-xs max-sm:px-2 sm:-mr-5 sm:-ml-12 sm:text-sm",
		passedPreClassName,
		"shiki-code-block",
		!hideLineNumbers && "shiki-line-numbers",
		filename === null && language === "plain" && "rounded-global",
		"rounded-bl-global rounded-br-global",
	);

	return (
		<CodeBlockFrame
			filename={filename}
			language={language}
			allowBlockExpand={allowBlockExpand}
			isBlockExpanded={isBlockExpanded}
			onToggleExpand={toggleExpand}
			className={className}
			preClassName={preClassName}
			preStyle={style}
		>
			<div dangerouslySetInnerHTML={{ __html: extractCodeInner(html) }} />
		</CodeBlockFrame>
	);
};

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode;
	language?: string;
	highlight?: string;
	"hide-line-numbers"?: "true";
	filename?: string;
	className?: string;
	preClassName?: string;
	style?: CSSProperties;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const {
		children: code,
		style,
		"hide-line-numbers": hide_line_numbers = false,
		filename = null,
		className,
		preClassName: passedPreClassName,
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

	const preClassName = cn(
		"-mx-4 overflow-x-scroll p-5 text-xs max-sm:px-2 sm:-mr-5 sm:-ml-12 sm:text-sm max-sm:[&>code>.block>.line]:whitespace-pre-wrap",
		passedPreClassName,
		filename === null && code_lang === "plain" && "rounded-global",
		is_block_expanded ? "rounded-bl-global rounded-br-global" : "max-h-[calc(100svh-120px-40px)]",
	);

	return (
		<CodeBlockFrame
			filename={filename}
			language={code_lang ?? "plain"}
			allowBlockExpand={allow_block_expand}
			isBlockExpanded={is_block_expanded}
			onToggleExpand={toggleExpand}
			className={className}
			preClassName={preClassName}
			preStyle={style}
		>
			<code>
				<CodeBlockChildren hide_line_numbers={hide_line_numbers === "true"}>
					{code_children}
				</CodeBlockChildren>
			</code>
		</CodeBlockFrame>
	);
};

type CodeBlockChildrenProps = { hide_line_numbers?: boolean };
const CodeBlockChildren = ({
	children,
	hide_line_numbers,
}: PropsWithChildren<CodeBlockChildrenProps>) => {
	if (typeof children === "string") {
		return children.split("\n").map((line, index) => (
			<span key={index} className="block">
				{line}
			</span>
		));
	}

	return Children.toArray(children).map((line, i) => {
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
	});
};
