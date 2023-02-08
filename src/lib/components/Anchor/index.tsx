import Link, { LinkProps } from "next/link";

type AdditionalLinkProps = {
	noRedirect?: true;
};

type LinkToProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
	LinkProps & {
		children?: React.ReactNode;
	} & React.RefAttributes<HTMLAnchorElement> &
	AdditionalLinkProps;

export const LinkTo = ({ className, ...props }: LinkToProps) => {
	const overrideProps: Partial<LinkToProps> = {};

	if (typeof props.href === "string") {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const isExternalLink = !props.href.startsWith(process.env.SITE_URL!);

		if (isExternalLink) {
			overrideProps.target = "_blank";
		}
	}

	return (
		<Link
			{...props}
			{...overrideProps}
			className={`text-primary hover:decoration-2 hover:decoration-current hover:decoration-solid hover:underline visited:no-underline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-secondary ${className}`}
		/>
	);
};
