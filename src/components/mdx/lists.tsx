import { Children, PropsWithChildren, ReactElement } from "react";

import { UnorderedListStyled, OrderedListStyled, UnorderedListBullet } from "components/mdx/styles";

export const ListItem = ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => {
	return (
		<li {...props}>
			<UnorderedListBullet />
			{children}
		</li>
	);
};

export const UnorderedList = ({
	children,
	...props
}: PropsWithChildren<Record<string, unknown>>) => {
	return (
		<UnorderedListStyled {...props}>
			{Children.map(children as ReactElement, ({ props }) =>
				typeof props === "undefined" ? null : <ListItem {...props} />
			)}
		</UnorderedListStyled>
	);
};

export const OrderedList = ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => {
	return <OrderedListStyled {...props}>{children}</OrderedListStyled>;
};
