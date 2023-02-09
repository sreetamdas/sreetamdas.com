import Link, { LinkProps } from "next/link";

type AdditionalLinkProps = {
	unStyled?: true;
};

type LinkToProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
	LinkProps & {
		children?: React.ReactNode;
	} & React.RefAttributes<HTMLAnchorElement> &
	AdditionalLinkProps;

export const LinkTo = (props: LinkToProps) => {
	const { unStyled, className: passedClasses, ...restProps } = props;
	const overrideProps: Partial<LinkToProps> = {};

	if (typeof props.href === "string") {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const isExternalLink = !props.href.startsWith(process.env.SITE_URL!) && props.href[0] !== "/";

		if (isExternalLink) {
			overrideProps.target = "_blank";
		}
	}

	let classes = "";
	if (!unStyled) {
		classes = "link-base ";
	}
	if (passedClasses) {
		classes += `${passedClasses} `;
	}

	return <Link {...restProps} {...overrideProps} className={classes.trimEnd()} />;
};
