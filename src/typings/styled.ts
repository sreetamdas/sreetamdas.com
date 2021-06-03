import "styled-components";

export type TGlobalThemeObject = {
	theme?: "light" | "dark";
	getCSSVarValue: (variable: string) => string | undefined;
	changeThemeVariant: (type: TGlobalThemeObject["theme"]) => void;
};

declare module "styled-components" {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface DefaultTheme extends TGlobalThemeObject {}
}
