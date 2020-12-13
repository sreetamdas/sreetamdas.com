export const HIDE_NAVBAR_PAGES = ["fancy-pants"];

/**
 *
 * @param path page pathname without initial slash
 */
export const checkIfNavbarShouldBeHidden = (path: string) =>
	HIDE_NAVBAR_PAGES.includes(path);
