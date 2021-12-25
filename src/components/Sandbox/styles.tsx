import styled, { css } from "styled-components";

import { whenProp } from "@/domains/style/helpers";
import { fullWidthMixin } from "@/styles/layouts";

export const Wrapper = styled.div`
	${whenProp(
		"$bleed",
		css`
			${fullWidthMixin}
			padding: 0 50px;
		`
	)}
`;
