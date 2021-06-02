import "styled-components";

export type TGlobalThemeObject = {
	theme?: "light" | "dark";
	getCSSVarValue: (variable: string) => string | undefined;
	changeThemeVariant: (type: TGlobalThemeObject["theme"]) => void;
};
