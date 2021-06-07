import { useState } from "react";
import styled, { css } from "styled-components";

export const DarkModeToggle = () => {
	const [darkMode, setDarkMode] = useState(false);

	return <Switch dark={darkMode} onClick={() => setDarkMode(!darkMode)} />;
};

const Switch = styled.div<{ dark: boolean }>`
	border-radius: 50%;
	width: 36px;
	height: 36px;
	position: relative;
	box-shadow: inset 16px -16px 0 0 #fff;
	-webkit-transform: scale(1) rotate(-2deg);
	transform: scale(1) rotate(-2deg);
	-webkit-transition: box-shadow 0.5s ease 0s, -webkit-transform 0.4s ease 0.1s;
	transition: box-shadow 0.5s ease 0s, -webkit-transform 0.4s ease 0.1s;
	transition: box-shadow 0.5s ease 0s, transform 0.4s ease 0.1s;
	transition: box-shadow 0.5s ease 0s, transform 0.4s ease 0.1s, -webkit-transform 0.4s ease 0.1s;

	&:before {
		content: "";
		width: inherit;
		height: inherit;
		border-radius: inherit;
		position: absolute;
		left: 0;
		top: 0;
		-webkit-transition: background 0.3s ease;
		transition: background 0.3s ease;
	}
	&:after {
		content: "";
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin: -4px 0 0 -4px;
		position: absolute;
		top: 50%;
		left: 50%;
		box-shadow: 0 -23px 0 #5628ee, 0 23px 0 #5628ee, 23px 0 0 #5628ee, -23px 0 0 #5628ee,
			15px 15px 0 #5628ee, -15px 15px 0 #5628ee, 15px -15px 0 #5628ee, -15px -15px 0 #5628ee;
		-webkit-transform: scale(0);
		transform: scale(0);
		-webkit-transition: all 0.3s ease;
		transition: all 0.3s ease;
	}

	${({ dark }) =>
		dark
			? css`
					box-shadow: inset 32px -32px 0 0 #fff;
					-webkit-transform: scale(0.5) rotate(0deg);
					transform: scale(0.5) rotate(0deg);
					-webkit-transition: box-shadow 0.2s ease 0s, -webkit-transform 0.3s ease 0.1s;
					transition: box-shadow 0.2s ease 0s, -webkit-transform 0.3s ease 0.1s;
					transition: transform 0.3s ease 0.1s, box-shadow 0.2s ease 0s;
					transition: transform 0.3s ease 0.1s, box-shadow 0.2s ease 0s,
						-webkit-transform 0.3s ease 0.1s;

					&:before {
						background: #5628ee;
						-webkit-transition: background 0.3s ease 0.1s;
						transition: background 0.3s ease 0.1s;
					}
					&:after {
						-webkit-transform: scale(1.5);
						transform: scale(1.5);
						-webkit-transition: -webkit-transform 0.5s ease 0.15s;
						transition: -webkit-transform 0.5s ease 0.15s;
						transition: transform 0.5s ease 0.15s;
						transition: transform 0.5s ease 0.15s, -webkit-transform 0.5s ease 0.15s;
					}
			  `
			: null}
`;
