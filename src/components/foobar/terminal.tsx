import { useRouter } from "next/router";
import {
	useState,
	useEffect,
	MouseEvent,
	useContext,
	ChangeEvent,
	FormEvent,
} from "react";
import styled from "styled-components";

import { FoobarContext } from "components/foobar";
import { Center } from "styles/layouts";

const TerminalBackdrop = styled.div`
	background-color: #000000cc;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 100vh;
`;
const TerminalContainer = styled.form`
	background-color: var(--color-background);
	color: var(--color-primary);
	/* position: absolute;
	top: 20vh; */
	display: grid;
	justify-content: center;
	margin-top: 20vh;
	grid-template-columns: 4fr 1fr;
	width: max-content;
	min-width: 40vw;
	max-width: 80vw;
	border-radius: 5px;
	border: 2px solid var(--color-primary-accent);
	margin-bottom: 5px;
`;
const TerminalInput = styled.input<{ isButton?: boolean; konami?: boolean }>`
	padding: 10px 10px 10px ${({ isButton }) => (isButton ? "10px" : "0")};
	font-size: 24px;
	background-color: ${({ isButton }) =>
		isButton ? "var(--color-primary-accent)" : "transparent"};
	color: ${({ konami }) => (konami ? "var(--color-background)" : "var(--color-primary)")};
	border: none;
	font-family: var(--font-family-code);

	&:focus {
		outline: none;
	}
`;

type TTerminalProps = {
	foobar?: string;
	visible?: boolean;
	toggleTerminal: () => void;
};
const Terminal = ({ visible = false, toggleTerminal }: TTerminalProps) => {
	const router = useRouter();
	const [terminalVisible, setTerminalVisible] = useState(visible);
	const { konami } = useContext(FoobarContext);
	const [goto, setGoto] = useState("");

	const toggleTerminalVisible = () => {
		setTerminalVisible((prev) => !prev);
		toggleTerminal();
	};
	const handleGoToSubmit = (
		event: FormEvent<HTMLFormElement> | MouseEvent<HTMLInputElement>
	) => {
		event.stopPropagation();
		event.preventDefault();

		if (goto !== "") router.push(`/foobar/${goto}`);
		else if (goto === "") router.push("/foobar");
		resetTerminal();
	};
	const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
		setGoto(event.target.value);
	};
	const ignoreClick = (event: MouseEvent<HTMLFormElement>) => {
		event.stopPropagation();
	};
	const resetTerminal = () => {
		setGoto("");
		toggleTerminalVisible();
	};

	useEffect(() => {
		setTerminalVisible(visible);
	}, [visible]);

	return terminalVisible ? (
		<TerminalBackdrop onClick={toggleTerminalVisible}>
			<Center>
				<TerminalContainer onClick={ignoreClick} onSubmit={handleGoToSubmit}>
					{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
					<label
						style={{
							paddingLeft: "10px",
							fontSize: "24px",
							fontFamily: "var(--font-family-code)",
						}}
					>
						/foobar/
						<TerminalInput
							value={goto}
							onChange={handleOnChange}
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
						/>
					</label>
					<TerminalInput
						type="submit"
						value="GO"
						isButton
						{...{ konami }}
						onClick={(event) => handleGoToSubmit(event)}
					/>
				</TerminalContainer>
				<small style={{ fontSize: "12px" }}>
					Go to page, <code>Esc</code> or click anywhere to escape
				</small>
			</Center>
		</TerminalBackdrop>
	) : null;
};

export { Terminal };
