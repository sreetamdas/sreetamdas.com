import { Children, PropsWithChildren, ReactElement } from "react";

import { UnorderedListStyled, OrderedListStyled, UnorderedListBullet } from "./styles";

export const ListItem = ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
	<li {...props}>
		<UnorderedListBullet />
		<span>{children}</span>
	</li>
);

export const UnorderedList = ({
	children,
	...props
}: PropsWithChildren<Record<string, unknown>>) => (
	<UnorderedListStyled {...props}>
		{Children.map(children as ReactElement, ({ props }) =>
			typeof props === "undefined" ? null : <ListItem {...props} />
		)}
	</UnorderedListStyled>
);

export const OrderedList = ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
	<OrderedListStyled {...props}>{children}</OrderedListStyled>
);
