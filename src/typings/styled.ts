import { theme } from "@/styles";
import "styled-components";

export type StyledThemeObject = {
	themeType: "light" | "dark";
	theme: typeof theme["light"] | typeof theme["dark"];
	changeThemeVariant: (type: StyledThemeObject["themeType"]) => void;
};

declare module "styled-components" {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface DefaultTheme extends StyledThemeObject {}
}
