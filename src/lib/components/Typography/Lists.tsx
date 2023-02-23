import { Children, HTMLAttributes, isValidElement } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";

export const UnorderedList = (props: HTMLAttributes<HTMLUListElement>) => (
	<ul className="my-3 mx-0 pl-0" {...props}>
		{Children.map(props.children, (child) => {
			if (isValidElement(child)) {
				return (
					<li className="mb-3 flex list-none items-start p-0 last:mb-0 only:mt-3" {...child.props}>
						<FaLongArrowAltRight aria-label="marker" className="mr-2.5 mt-1 text-primary" />
						<span className="shrink grow basis-0">{child.props.children}</span>
					</li>
				);
			}
			return null;
		})}
	</ul>
);
