/* eslint-disable no-console */
import { useState, useEffect } from "react";

const Console = (): null => {
	const [initialRender, setInitialRender] = useState(true);

	useEffect(() => {
		console.log("hello world!");
		setInitialRender(false);
	}, []);

	useEffect(() => {
		console.log("changed to:", initialRender);
	}, [initialRender]);

	return null;
};

export { Console };
