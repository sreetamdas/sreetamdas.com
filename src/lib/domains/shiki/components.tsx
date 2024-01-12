import { clsx } from "clsx";
import { isObject } from "lodash-es";
import {
	type ReactNode,
	type CSSProperties,
	Children,
	type DetailedHTMLProps,
	type HTMLAttributes,
	isValidElement,
} from "react";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode;
	language?: string;
	highlight?: string;

	className?: string;
	style?: CSSProperties;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const { children: code_element, style } = props;

	if (!isValidElement(code_element)) {
		return null;
	}

	const lang = code_element?.props["data-language"];

	return (
		<div className="my-5 flex flex-col">
			<div className="flex justify-end">
				<span className="rounded-t-global px-2 py-1 font-mono  text-zinc-400" style={style}>
					{lang}
				</span>
			</div>
			<pre
				className="-ml-12 -mr-5 overflow-x-scroll rounded-global p-5 text-sm max-md:-ml-6"
				style={style}
			>
				<code {...code_element?.props}>
					{Children.toArray(code_element?.props.children)
						.filter((line) => line !== "\n")
						.map((line, i) => {
							// console.log({ line });
							const should_line_highlight =
								isObject(line) &&
								"props" in line &&
								(line.props["data-highlight"] ?? "false") === "true";

							return (
								<span
									key={i}
									className={clsx(
										"block",
										should_line_highlight &&
											"-mx-5 border-l-4 border-[#a86efd] bg-[#a86efd15] px-4",
									)}
								>
									<span
										className={clsx(
											"-ml-2 mr-2 hidden w-[2rem] select-none pr-2 text-right text-zinc-600 md:inline-block",
											should_line_highlight && "text-[#a86efd]",
										)}
									>
										{i + 1}
									</span>
									{line}
								</span>
							);
						})}
				</code>
			</pre>
		</div>
	);
};
