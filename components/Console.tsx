/* eslint-disable no-console */
import { useEffect } from "react";

const Console = (): null => {
	useEffect(() => {
		console.log("hello world!");
	}, []);

	return null;
};

export { Console };
