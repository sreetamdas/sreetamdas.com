import { Children, HTMLAttributes, OlHTMLAttributes, PropsWithChildren } from "react";
import { isElement } from "react-is";

import { UnorderedListStyled, OrderedListStyled, UnorderedListBullet } from "./styles";

export const ListItem = ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
	<li {...props}>
		<UnorderedListBullet />
		<span>{children}</span>
	</li>
);

export const MDXUnorderedList = (props: HTMLAttributes<HTMLUListElement>) => (
	<UnorderedListStyled {...props}>
		{Children.map(props.children, (child) => {
			if (isElement(child)) {
				const childProps = child.props;
				return <ListItem {...childProps} />;
			}
			return null;
		})}
	</UnorderedListStyled>
);

export const MDXOrderedList = (props: OlHTMLAttributes<HTMLOListElement>) => (
	<OrderedListStyled {...props} />
);
