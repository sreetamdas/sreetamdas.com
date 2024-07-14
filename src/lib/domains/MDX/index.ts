import { readdir } from "fs/promises";
import { extname } from "path";

export async function getMDXFiles(dir: string) {
	return (await readdir(dir)).filter((file) => extname(file) === ".mdx");
}
