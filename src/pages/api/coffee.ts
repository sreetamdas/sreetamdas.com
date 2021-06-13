import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		res.status(418).json({ message: "I'm a teapot", foobar: "/foobar/teapot" });
	} else {
		res.status(301).send("POST a request, please ;)");
	}
};
