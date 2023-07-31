import { type HTMLAttributes, Children, isValidElement } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";

export const UnorderedList = (props: HTMLAttributes<HTMLUListElement>) => (
	<ul className="mx-0 my-3 pl-0" {...props}>
		{Children.map(props.children, (child) => {
			if (isValidElement(child)) {
				return (
					<li className="mb-3 flex list-none items-start p-0 last:mb-0 only:mt-3" {...child.props}>
						<FaLongArrowAltRight aria-label="marker" className="mr-2.5 mt-1 text-primary" />
						<span className="shrink grow basis-0 [&>ul>li]:m-0 [&>ul]:my-0">
							{child.props.children}
						</span>
					</li>
				);
			}
			return null;
		})}
	</ul>
);

export const Code = ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
	<code
		className="mx-0.5 rounded bg-foreground/10 p-1 font-mono text-sm 
		transition-[color,background-color] dark:bg-foreground/20"
		{...props}
	>
		{children}
	</code>
);
